import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,            
} from 'react-native';

// ↓ Add these imports to match WonderScreen’s structure:
import TopNav from '../../components/common/TopNav';                    
import BottomNav from '../../components/common/BottomNav';             
import { Globe } from '../../components/globe/Globe';                   
import { STATIC_REGIONS } from '../../data/StaticRegions';               

import {
  fetchAllRegions,
  fetchRegionDetail,
  RegionMetadata,
  RegionDetail,
} from '../../services/regionService';

export function HarmonyStatScreen({ navigation }: { navigation: any }) {     // ← Accept navigation prop
  const [regions, setRegions] = React.useState<RegionMetadata[]>([]);
  const [loadingList, setLoadingList] = React.useState<boolean>(true);
  const [selectedRegionDetail, setSelectedRegionDetail] = React.useState<RegionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      setLoadingList(true);
      const list = await fetchAllRegions();
      setRegions(list);
      setLoadingList(false);
    })();
  }, []);

  const onRegionPress = async (region: RegionMetadata) => {
    setLoadingDetail(true);
    const detail = await fetchRegionDetail(region.id);
    if (detail) {
      setSelectedRegionDetail(detail);
    } else {
      console.warn(`No detail for region ${region.id}`);
    }
    setLoadingDetail(false);
  };

  // ─── RENDER A SINGLE REGION CARD ─────────────────────────────────────────────
  const renderRegion = ({ item }: { item: RegionMetadata }) => (
    <TouchableOpacity onPress={() => onRegionPress(item)} style={styles.regionCard}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <Text style={styles.regionName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // ─── MAIN RETURN ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>                                
      <TopNav navigation={navigation} />                                  

      <View style={styles.container}>
        <Text style={styles.headerTitle}>Harmony Stat</Text>                
        <Text style={styles.headerSubtitle}>
          Explore Aurora regions—tap to hear a story or calming music!
        </Text>                                                            

        <Globe
          regions={STATIC_REGIONS}
          diameter={250}                                         
          onRegionPress={(regionId: string) => {
            // 1) First, auto-log or fetch detail if you want
            console.log('HarmonyStatScreen → tapped region:', regionId);
            // 2) Then navigate to a “PlayStory” or similar
            navigation.navigate('StoryWorld', { regionKey: regionId });
          }}
        />

        {loadingList ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : regions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No regions available.</Text>
          </View>
        ) : (
          <FlatList
            data={regions}
            keyExtractor={(item) => item.id}
            renderItem={renderRegion}
            contentContainerStyle={{ padding: 16 }}
          />
        )}

        {loadingDetail && (
          <View style={styles.detailOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {selectedRegionDetail && !loadingDetail && (
          <View style={styles.detailModal}>
            <Text style={styles.detailTitle}>{selectedRegionDetail.name}</Text>
            <Text style={styles.detailDescription}>{selectedRegionDetail.description}</Text>
            <Image source={{ uri: selectedRegionDetail.highResUrl }} style={styles.highResImage} />
            <TouchableOpacity onPress={() => setSelectedRegionDetail(null)} style={styles.closeButton}>
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BottomNav navigation={navigation} activeScreen="Harmony" />    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F9FF', 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E40AF', 
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4B5563', 
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  regionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    marginRight: 12,
    borderRadius: 8,
  },
  regionName: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  highResImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
});
