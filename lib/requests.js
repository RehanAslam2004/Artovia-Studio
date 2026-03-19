import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    orderBy, 
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

/**
 * Get all custom requests
 */
export async function getAllRequests() {
    if (!isFirebaseConfigured || !db) {
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        const q = query(collection(db, 'custom_requests'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString() || null
        }));
        return { success: true, requests };
    } catch (error) {
        console.error('Error getting requests:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update request status or price
 */
export async function updateRequest(requestId, data) {
    if (!isFirebaseConfigured || !db) {
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        const requestRef = doc(db, 'custom_requests', requestId);
        await updateDoc(requestRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating request:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a request
 */
export async function deleteRequest(requestId) {
    if (!isFirebaseConfigured || !db) {
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        await deleteDoc(doc(db, 'custom_requests', requestId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting request:', error);
        return { success: false, error: error.message };
    }
}
