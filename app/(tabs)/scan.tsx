import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Flame, Camera as CameraIcon, X, Zap, Check, RefreshCw } from 'lucide-react-native';
import { analyzeImage, AIAnalysisResult } from '../../src/services/aiService';
import { logMeal } from '../../src/services/mealService';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');

    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!permission) requestPermission();

        // Suggest category based on time
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) setSelectedCategory('Breakfast');
        else if (hour >= 11 && hour < 16) setSelectedCategory('Lunch');
        else if (hour >= 16 && hour < 22) setSelectedCategory('Dinner');
        else setSelectedCategory('Snack');
    }, [permission]);

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && !isScanning) {
            setIsScanning(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: true,
                });

                if (photo) {
                    const resizedPhoto = await ImageManipulator.manipulateAsync(
                        photo.uri,
                        [{ resize: { width: 800 } }],
                        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
                    );

                    setCapturedImage(resizedPhoto.uri);

                    if (resizedPhoto.base64) {
                        const result = await analyzeImage(resizedPhoto.base64);
                        setAnalysisResult(result);
                        setShowReview(true);
                    }
                }
            } catch (error: any) {
                console.error("Scanning Error:", error);
                Alert.alert("Error", error.message || "Failed to analyze image.");
            } finally {
                setIsScanning(false);
            }
        }
    };

    const handleSaveMeal = async () => {
        if (!user || !analysisResult) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            await logMeal(user.uid, {
                foodName: analysisResult.foodName,
                calories: analysisResult.calories,
                protein: analysisResult.protein,
                carbs: analysisResult.carbs,
                fat: analysisResult.fat,
                source: 'AI',
                category: selectedCategory,
                date: today,
                createdAt: new Date().toISOString(),
                imageUrl: capturedImage || undefined
            });

            setShowReview(false);
            setCapturedImage(null);
            setAnalysisResult(null);
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert("Error", "Failed to save meal.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Flame size={32} color="#7C5CFF" />
                <Text style={styles.title}>Scan Food</Text>
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    ref={cameraRef}
                    facing="back"
                />
                <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                </View>

                {isScanning && (
                    <View style={styles.scanningOverlay}>
                        <ActivityIndicator size="large" color="#7C5CFF" />
                        <Text style={styles.scanningText}>Analyzing with AI...</Text>
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.captureButton, isScanning && styles.disabledButton]}
                    onPress={takePicture}
                    disabled={isScanning}
                >
                    <View style={styles.captureButtonInner}>
                        <CameraIcon color="#000" size={32} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.hintText}>Point at your food and tap to scan</Text>
            </View>

            {/* Review Modal */}
            <Modal visible={showReview} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>AI Analysis</Text>
                            <TouchableOpacity onPress={() => setShowReview(false)}>
                                <X color="#666" size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {capturedImage && (
                                <Image source={{ uri: capturedImage }} style={styles.modalImage} />
                            )}

                            <View style={styles.resultContainer}>
                                <Text style={styles.foodName}>{analysisResult?.foodName}</Text>

                                <Text style={styles.sectionLabel}>Category</Text>
                                <View style={styles.categoryGrid}>
                                    {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryButton,
                                                selectedCategory === cat && styles.categoryButtonActive
                                            ]}
                                            onPress={() => setSelectedCategory(cat)}
                                        >
                                            <Text style={[
                                                styles.categoryButtonText,
                                                selectedCategory === cat && styles.categoryButtonTextActive
                                            ]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionLabel}>Nutrition Facts</Text>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Calories</Text>
                                        <Text style={styles.statValue}>{analysisResult?.calories}</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Protein</Text>
                                        <Text style={styles.statValue}>{analysisResult?.protein}g</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Carbs</Text>
                                        <Text style={styles.statValue}>{analysisResult?.carbs}g</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Fat</Text>
                                        <Text style={styles.statValue}>{analysisResult?.fat}g</Text>
                                    </View>
                                </View>

                                <View style={styles.confidenceRow}>
                                    <Zap size={14} color="#FACC15" />
                                    <Text style={styles.confidenceText}>
                                        AI Confidence: {(analysisResult?.confidence || 0 * 100).toFixed(0)}%
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={() => {
                                    setShowReview(false);
                                    setCapturedImage(null);
                                    setAnalysisResult(null);
                                }}
                            >
                                <RefreshCw color="#FFF" size={20} />
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
                                <Check color="#FFF" size={20} />
                                <Text style={styles.saveText}>Log Meal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    cameraContainer: {
        flex: 1,
        marginHorizontal: 20,
        borderRadius: 32,
        overflow: 'hidden',
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#7C5CFF',
        borderRadius: 24,
        backgroundColor: 'rgba(124, 92, 255, 0.05)',
    },
    controls: {
        padding: 40,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        padding: 4,
        marginBottom: 16,
    },
    captureButtonInner: {
        flex: 1,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    hintText: {
        color: '#666',
        fontSize: 14,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#0F0F0F',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    permissionText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: '#7C5CFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    scanningOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanningText: {
        color: '#FFFFFF',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    modalImage: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        marginBottom: 24,
    },
    resultContainer: {
        marginBottom: 24,
    },
    sectionLabel: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#2A2A2A',
        borderWidth: 1,
        borderColor: '#333',
    },
    categoryButtonActive: {
        backgroundColor: '#7C5CFF',
        borderColor: '#7C5CFF',
    },
    categoryButtonText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '500',
    },
    categoryButtonTextActive: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    foodName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#2A2A2A',
        padding: 16,
        borderRadius: 16,
    },
    statLabel: {
        color: '#999',
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: '#7C5CFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    confidenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    confidenceText: {
        color: '#999',
        fontSize: 12,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        marginBottom: 20,
    },
    retryButton: {
        flex: 1,
        backgroundColor: '#333',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    retryText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 2,
        backgroundColor: '#7C5CFF',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    saveText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
