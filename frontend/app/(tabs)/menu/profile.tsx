import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../context/AuthContex';
import { getUserProfile } from '../../../services/api';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard as Edit,
  Car,
} from 'lucide-react-native';
import EmptyHeader from '@/components/headers/EmptyHeader';
import ProfileHeader from '@/components/headers/ProfileHeader';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<String>("");
  const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        setError('Échec du chargement des données de profil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5e72e4" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback data if API fails
  const profileData = profile || {
    name: user?.username || 'User',
    email: 'a.nouressaid@autohall.ma',
    phone: '+212 600 654 065',
    site: 'AutoHall Rabat',
    joinDate: 'Vendredi 01 Septembre 2023',
    bio: 'Software developer with expertise in mobile application development.',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  };
  //<EmptyHeader backgroundColor='#5e72e4'/>
  return (
    <View style={{ flex: 1 }}>
      <ProfileHeader backTo='/menu' title=' '>
        <View style={styles.header}>
          <Image source={{ uri: profileData.avatar || defaultAvatar }} style={styles.avatar} />
          <Text style={styles.name}>{profileData.name}</Text>
        </View>
      </ProfileHeader>
      <ScrollView style={styles.container}>
        {/* <View style={styles.header}>
          <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{profileData.name}</Text>
        </View> */}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations personnels</Text>

          <View style={styles.infoItem}>
            <Mail size={20} color="#5e72e4" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{profileData.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Phone size={20} color="#5e72e4" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{profileData.phone}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MapPin size={20} color="#5e72e4" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Site</Text>
              <Text style={styles.infoValue}>{profileData?.site}</Text>
            </View>
          </View>

          {/* <View style={styles.infoItem}>
            <Car size={20} color="#5e72e4" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Marque</Text>
              <Text style={styles.infoValue}>{profileData?.marque}</Text>
            </View>
          </View> */}

          <View style={styles.infoItem}>
            <Calendar size={20} color="#5e72e4" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Date d'embauche</Text>
              <Text style={styles.infoValue}>{profileData.joinDate}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fe',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#5e72e4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  header: {
    // backgroundColor: '#5e72e4',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    marginTop: 15,
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 5,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bioSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  bioText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#f5365c',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});
