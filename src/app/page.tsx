'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, ListItemIcon } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';


interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  userId: string;
}

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed', user);
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
      console.log('No user, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchItems = async (userId: string) => {
    console.log('Fetching items for user', userId);
    try {
      const q = query(collection(db, 'pantryItems'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
      console.log('Fetched items', fetchedItems);
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
        console.log('Adding item', newItem);
        const docRef = await addDoc(collection(db, 'pantryItems'), {
          ...newItem,
          userId: user.uid,
        });
        console.log('Document written with ID: ', docRef.id);
        setNewItem({ name: '', quantity: '' });
        fetchItems(user.uid);
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  };

  const editItem = async (item: PantryItem) => {
    const updatedName = prompt('Enter new name:', item.name);
    const updatedQuantity = prompt('Enter new quantity:', item.quantity);
    if (updatedName && updatedQuantity) {
      await updateDoc(doc(db, 'pantryItems', item.id), {
        name: updatedName,
        quantity: updatedQuantity,
      });
      if (user) fetchItems(user.uid);
    }
  };

  const deleteItem = async (itemId: string) => {
    await deleteDoc(doc(db, 'pantryItems', itemId));
    if (user) fetchItems(user.uid);
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // This will prevent any rendering while redirecting
  }


  return (
    <div style={{ backgroundImage: 'url(background.jpg)', backgroundSize: 'cover', backdropFilter: '8px', height: '100vh' }}>
<Container maxWidth="sm" sx={{ 
  backgroundImage: 'url("background.jpg")',
  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
  padding: 3, 
  borderRadius: 2, 
  boxShadow: 3,
  marginTop: 4
}}>        <Typography variant="h4" component="h1" gutterBottom>
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
        <Button variant="contained" color="primary" onClick={addItem}>
          Add Item
        </Button>
        <List>
  {items.map((item) => (
    <ListItem key={item.id} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', marginBottom: 1, borderRadius: 1 }}>
      <ListItemIcon>
        {getItemIcon(item.name)}
      </ListItemIcon>
      <ListItemText primary={item.name} secondary={`Quantity: ${item.quantity}`} />
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
    </div>
  );
}