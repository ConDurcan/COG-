import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { useRouter } from 'expo-router';

import League from './League';

export default function CreateLeague() {
    const router = useRouter();

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}
                    style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New League</Text>
            
            <TouchableOpacity onPress={() => {}}>
                <Text style = {styles.resetText}>Reset</Text>
            </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1e1e2e',
        backgroundColor: '#111118',
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    backButtonText: {
        color: '#4a9eff',
        fontSize: 17,
        fontWeight: '600',
    },
    headerTitle: {
        color: '#f0f0ff',
        fontSize: 18,
        fontWeight: '700',
    },
    resetText: {
        color: '#9ca3af',
        fontSize: 17,
    },
});