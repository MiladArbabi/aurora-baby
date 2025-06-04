// src/components/carescreen/InferredLogItem.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { InferredLogEntry } from '../../models/InferredLog';
import { submitLogFeedback, getAllLogFeedback } from '../../services/ConfidenceService';
import { format } from 'date-fns';

interface InferredLogItemProps {
  log: InferredLogEntry;
  onPress?: () => void;
}

export default function InferredLogItem({ log, onPress }: InferredLogItemProps) {
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // On mount, see if we already have feedback for this logId
  useEffect(() => {
    (async () => {
      const allFeedback = await getAllLogFeedback();
      if (allFeedback.hasOwnProperty(log.id)) {
        setFeedback(allFeedback[log.id]);
      }
    })();
  }, [log.id]);

  const onPressFeedback = async (wasCorrect: boolean) => {
    setSubmitting(true);
    try {
      await submitLogFeedback(log.id, wasCorrect);
      setFeedback(wasCorrect);
    } catch (err) {
      console.warn('[InferredLogItem] feedback failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
       <TouchableOpacity
         style={[styles.container, { borderWidth: 1, borderColor: '#FF0000' }]}
         onPress={onPress}
         activeOpacity={0.8}
       >
         <View style={styles.headerRow}>
           <Text style={styles.time}>
             {format(new Date(log.timestamp), 'hh:mm a')}
           </Text>
           <Text style={styles.type}>
             {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
           </Text>
           {typeof log.confidence === 'number' && (
             <Text style={styles.confidence}>
               {Math.round(log.confidence * 100)}%
             </Text>
           )}
         </View>
    
         {/* Render log data */}
         <Text style={styles.details}>
           {JSON.stringify(log.data)}
         </Text>
    
         <View style={styles.feedbackRow}>
           {submitting ? (
             <ActivityIndicator size="small" color="#666" />
           ) : feedback === null ? (
             <>
               <TouchableOpacity
                 style={[styles.feedbackButton, styles.correct]}
                 onPress={() => onPressFeedback(true)}
               >
                 <Text style={styles.feedbackText}>✔︎ Correct</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.feedbackButton, styles.incorrect]}
                 onPress={() => onPressFeedback(false)}
               >
                 <Text style={styles.feedbackText}>✘ Wrong</Text>
               </TouchableOpacity>
             </>
           ) : (
             <Text style={styles.thanks}>
               {feedback ? 'Marked as correct 👍' : 'Marked as incorrect 👎'}
             </Text>
           )}
         </View>
       </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: { fontWeight: '500', fontSize: 14, marginRight: 12 },
  type: { fontSize: 16, fontWeight: '600', color: '#333', marginRight: 12 },
  confidence: { fontSize: 14, color: '#888' },

  details: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 6,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  correct: {
    backgroundColor: '#4CAF50',
  },
  incorrect: {
    backgroundColor: '#F44336',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 13,
  },
  thanks: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
});
