// components/pages/WishlistPage.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, WishlistItem, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ListChecks, PlusCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WishlistPageProps {
  user: User | null;
  profile: Profile | null;
}

export default function WishlistPage({ user, profile }: WishlistPageProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error: any) {
      toast.error('Could not fetch your wishlist.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !category || !user) {
      toast.error('Please fill out all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          item_description: description,
          category: category,
        })
        .select();
        
      if (error) throw error;
      setWishlistItems([data[0], ...wishlistItems]);
      setDescription('');
      setCategory('');
      toast.success('Wishlist item added!');
    } catch (error: any) {
      toast.error('Failed to add item to wishlist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      toast.success('Wishlist item removed.');
    } catch (error) {
        toast.error('Failed to remove item.');
    }
  };

  if (profile?.role !== 'student') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Only students can have a wishlist.</p>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <ListChecks className="w-8 h-8 mr-3 text-blue-600" />
            My Wishlist
          </CardTitle>
          <CardDescription>Add and manage resources you are seeking from the community.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Add a new item</h3>
                <div className="space-y-2">
                    <Label htmlFor="description">Resource Description</Label>
                    <Input id="description" placeholder="e.g., 'A used laptop for programming'" value={description} onChange={e => setDescription(e.target.value)} disabled={submitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} disabled={submitting}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="books">📚 Books & Study Materials</SelectItem>
                            <SelectItem value="electronics">💻 Electronics & Gadgets</SelectItem>
                            <SelectItem value="courses">🎓 Online Courses</SelectItem>
                            <SelectItem value="other">🎁 Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2"/>
                    {submitting ? 'Adding...' : 'Add to Wishlist'}
                </Button>
            </form>
        </CardContent>
      </Card>
      <Card>
          <CardHeader>
              <CardTitle>Current Items</CardTitle>
          </CardHeader>
          <CardContent>
              {loading ? (
                  <p>Loading wishlist...</p>
              ) : wishlistItems.length > 0 ? (
                  <ul className="space-y-3">
                      {wishlistItems.map(item => (
                          <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div>
                                  <p className="font-medium">{item.item_description}</p>
                                  <p className="text-sm text-gray-500">Category: {item.category} &bull; Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500"/>
                              </Button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-gray-500">Your wishlist is empty.</p>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
