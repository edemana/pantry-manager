'use client';

import { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, TextField, List, ListItem, 
  ListItemText, ListItemSecondaryAction, IconButton, ListItemIcon 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { db, auth, storage } from '../firebase';
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  price?: string; // Include price field
  imageUrl?: string;
  userId: string;
}

interface NewItemState {
  name: string;
  quantity: string;
  price: string; // Include price field
  image: File | null;
}

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState<NewItemState>({ name: '', quantity: '', price: '', image: null });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        await fetchItems(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchItems = async (userId: string) => {
    try {
      const q = query(collection(db, 'pantryItems'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const getItemIcon = (itemName: string) => {
    const lowerName = itemName.toLowerCase();
    if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) {
      return <KitchenIcon />;
    } else if (lowerName.includes('fruit') || lowerName.includes('vegetable')) {
      return <LocalDiningIcon />;
    } else {
      return <ShoppingBasketIcon />;
    }
  };

  const addItem = async () => {
    if (newItem.name && newItem.quantity && user) {
      try {
        let imageUrl = '';
        if (newItem.image) {
          const imageRef = ref(storage, `images/${newItem.image.name}`);
          await uploadBytes(imageRef, newItem.image);
          imageUrl = await getDownloadURL(imageRef);
        }

        await addDoc(collection(db, 'pantryItems'), {
          name: newItem.name,
          quantity: newItem.quantity,
          price: newItem.price, // Add price field
          imageUrl,
          userId: user.uid,
        });

        setNewItem({ name: '', quantity: '', price: '', image: null });
        fetchItems(user.uid);
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  };

  const editItem = async (item: PantryItem) => {
    const updatedName = prompt('Enter new name:', item.name);
    const updatedQuantity = prompt('Enter new quantity:', item.quantity);
    const updatedPrice = prompt('Enter new price (per unit):', item.price ?? '');
    if (updatedName && updatedQuantity && updatedPrice) {
      try {
        await updateDoc(doc(db, 'pantryItems', item.id), {
          name: updatedName,
          quantity: updatedQuantity,
          price: updatedPrice, // Update price field
        });
        if (user) fetchItems(user.uid);
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'pantryItems', itemId));
      if (user) fetchItems(user.uid);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewItem({ ...newItem, image: e.target.files[0] });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.5)', 
      padding: 3, 
      borderRadius: 2, 
      boxShadow: 3,
      marginTop: 4,
      backdropFilter: 'blur(15px)', 
    }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pantry Manager
      </Typography>
      <Button variant="outlined" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
      <TextField
        label="Item Name"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <TextField
        label="Quantity"
        value={newItem.quantity}
        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <TextField
        label="Price (per unit)"
        value={newItem.price}
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1.5rem' }}>
        <Button variant="contained" component="label">
          Upload Image
          <input type="file" accept="image/*" hidden onChange={handleImageCapture} />
        </Button>
        
        <Button variant="contained" color="primary" onClick={addItem} style={{ marginLeft: '1rem' }}>
          Add Item
        </Button>
      </div>
      <List>
        {items.map((item) => (
          <ListItem key={item.id} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', marginBottom: 1, borderRadius: 1 }}>
            <ListItemIcon>
              {getItemIcon(item.name)}
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              secondary={`Quantity: ${item.quantity} | Price: ${item.price}`} 
            />
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} style={{ width: 50, height: 50, marginLeft: '10px', borderRadius: '5px' }} />
            )}
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => editItem(item)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => deleteItem(item.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
