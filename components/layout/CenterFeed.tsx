// components/layout/CenterFeed.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Profile, Post, supabase, isSupabaseConnected, Like, Comment } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, Gift, ImagePlus, Link2, MoreHorizontal, Edit, Trash2, ShieldAlert, Copy, MessageSquareText, Twitter, Mail, Phone, SlidersHorizontal, BookOpen, Laptop, GraduationCap, CircleHelp, Loader2, SortAsc, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import PostSkeleton from './PostSkeleton';
import Image from 'next/image';

interface CenterFeedProps {
  user: User | null;
  profile: Profile | null;
  searchQuery: string;
}

const URL_REGEX = /https?:\/\/[^\s/$.?#].[^\s]*/i;

const fetchRichLinkPreview = async (url: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (url.includes('google.com')) {
      return {
        url: url,
        title: 'Google - Search the world\'s information',
        description: 'Search the world\'s information, including webpages, images, videos and more.',
        image: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
      };
    } else if (url.includes('wikipedia.org')) {
      return {
        url: url,
        title: 'Wikipedia, the free encyclopedia',
        description: 'Wikipedia is a free online encyclopedia, created and maintained by a community of volunteer editors through open collaboration and using a wiki-based editing system.',
        image: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png'
      };
    }
    return { url: url, title: url, description: null, image: null };

  } catch (error) {
    console.error("Failed to fetch rich link preview:", error);
    return { url: url, title: url, description: null, image: null };
  }
};


export default function CenterFeed({ user, profile, searchQuery }: CenterFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerType, setComposerType] = useState<'wisdom' | 'donation' | 'seeking'>('wisdom');
  
  const [content, setContent] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceCategory, setResourceCategory] = useState('');
  const [resourceContact, setResourceContact] = useState('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [donorDetails, setDonorDetails] = useState<Post | null>(null);
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  const [linkPreview, setLinkPreview] = useState<{ url?: string; title?: string; description?: string | null; image?: string | null; } | null>(null);
  const [loadingLinkPreview, setLoadingLinkPreview] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const foundUrl = content.match(URL_REGEX);
      if (foundUrl) {
        setLoadingLinkPreview(true);
        const preview = await fetchRichLinkPreview(foundUrl[0]);
        setLinkPreview(preview);
        setLoadingLinkPreview(false);
      } else {
        setLinkPreview(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);


  const updatePostInState = useCallback((postId: string, newPostData: Partial<Post>) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, ...newPostData } : p))
    );
  }, []);

  const removePostFromState = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  }, []);

  const addPostToState = useCallback((newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles(*), likes(*), comments(*, profiles(*))`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Could not fetch posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    let result = posts;
    if (searchQuery) {
      result = result.filter(post =>
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.resource_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filter !== 'all') {
      result = result.filter(post => post.post_type === filter);
    }
    if (sortBy === 'likes') {
      result.sort((a, b) => {
        const likesA = a.likes?.length || 0;
        const likesB = b.likes?.length || 0;
        if (likesB !== likesA) return likesB - likesA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else if (sortBy === 'comments') {
      result.sort((a, b) => {
        const commentsA = a.comments?.length || 0;
        const commentsB = b.comments?.length || 0;
        if (commentsB !== commentsA) return commentsB - commentsA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [posts, searchQuery, filter, sortBy]);

  useEffect(() => {
    if (!isSupabaseConnected) {
        setPosts([]);
        setLoading(false);
        return;
    }
    fetchPosts();

    const postsChannel = supabase
      .channel('posts_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: { new: Post }) => {
        const newPost = payload.new;
        addPostToState(newPost);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload: { new: Post }) => {
        const updatedPost = payload.new;
        updatePostInState(updatedPost.id, updatedPost);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload: { old: { id: string } }) => {
        removePostFromState(payload.old.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [fetchPosts, addPostToState, updatePostInState, removePostFromState]);

  const handlePostSubmit = async () => {
    if (!user || !profile || submitting) return;
    setSubmitting(true);

    const foundUrl = content.match(URL_REGEX);
    const linkUrl = foundUrl ? foundUrl[0] : undefined;

    let postData: any = { user_id: user.id, post_type: composerType, link_url: linkUrl };
    if (composerType === 'wisdom') {
      postData.content = content.trim();
      postData.link_title = linkPreview?.title;
      postData.link_description = linkPreview?.description;
      postData.link_image = linkPreview?.image;
    }
    if (composerType === 'donation' || composerType === 'seeking') {
        postData.resource_title = resourceTitle.trim();
        postData.resource_category = resourceCategory;
        if (!postData.resource_title || !postData.resource_category) {
            toast.error('Please fill out resource title and category.');
            setSubmitting(false);
            return;
        }
    }
    if (composerType === 'donation') {
        postData.resource_contact = resourceContact.trim();
        if (!postData.resource_contact) {
            toast.error('Please provide contact info for donation.');
            setSubmitting(false);
            return;
        }
    }
    
    setContent('');
    setResourceTitle('');
    setResourceCategory('');
    setResourceContact('');
    setPostImageFile(null);
    setLinkPreview(null);

    try {
      let imageUrl: string | undefined = undefined;
      if (postImageFile) {
          const filePath = `${user.id}/${Date.now()}_${postImageFile.name}`;
          const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, postImageFile);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(filePath);
          imageUrl = publicUrl;
      }
      postData.image_url = imageUrl;
      const { error } = await supabase.from('posts').insert(postData);
      if (error) throw error;
      toast.success('Post created successfully!');
    } catch (error: any) {
        toast.error(error.message || "Failed to create post.");
    } finally { setSubmitting(false); }
  };

  const handleLikeToggle = async (post: Post) => {
    if (!user || !profile) {
      toast.info("Please sign in to like posts.");
      return;
    }
    const hasLiked = post.likes?.some(like => like.user_id === user.id);
    const optimisticLikes = hasLiked
      ? post.likes?.filter(l => l.user_id !== user.id)
      : [...(post.likes || []), { id: Date.now(), post_id: post.id, user_id: user.id, created_at: new Date().toISOString() }];
    
    updatePostInState(post.id, { likes: optimisticLikes });

    try {
      if (hasLiked) {
        await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
      } else {
        await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
        if (post.user_id !== user.id) {
          await supabase.rpc('create_notification', { p_user_id: post.user_id, p_type: 'like', p_actor_id: user.id, p_post_id: post.id });
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Could not update like.");
      fetchPosts();
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComments[postId]?.trim();
    if (!user || !commentText || !profile) {
      toast.info("Please sign in and write a comment.");
      return;
    }

    const optimisticComment: Comment = {
      id: `${Date.now()}-${Math.random()}`,
      post_id: postId,
      user_id: user.id,
      content: commentText,
      created_at: new Date().toISOString(),
      profiles: profile
    };

    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), optimisticComment] } : p
      )
    );
    setNewComments(prev => ({ ...prev, [postId]: '' }));

    try {
      const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: commentText });
      if (error) {
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === postId ? { ...p, comments: p.comments?.filter(c => c.id !== optimisticComment.id) } : p
          )
        );
        throw error;
      }
      const post = posts.find(p => p.id === postId);
      if (post && post.user_id !== user.id) {
        await supabase.rpc('create_notification', { p_user_id: post.user_id, p_type: 'comment', p_actor_id: user.id, p_post_id: postId });
      }
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment.");
    }
  };
  
  const handleShare = (platform: 'twitter' | 'whatsapp' | 'copy', post: Post) => {
    const postUrl = `${window.location.origin}/?page=feed&post=${post.id}`;
    const postText = post.content || post.resource_title || 'Check out this post on Edubridgepeople!';
    const encodedText = encodeURIComponent(`"${postText}" - via @Edubridgepeople`);
    const encodedUrl = encodeURIComponent(postUrl);
    switch(platform) {
        case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank'); break;
        case 'whatsapp': window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank'); break;
        case 'copy':
          document.execCommand('copy');
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(postUrl)
              .then(() => toast.success('Post link copied!'))
              .catch(() => {
                const el = document.createElement('textarea');
                el.value = postUrl;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                toast.success('Post link copied!');
              });
          } else {
            const el = document.createElement('textarea');
            el.value = postUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            toast.success('Post link copied!');
          }
          break;
    }
  };

  const handleReportPost = (postId: string) => {
    const subject = encodeURIComponent(`Report on Post ID: ${postId}`);
    const body = encodeURIComponent(`I would like to report Post ID: ${postId} for the following reason:\n\n[Please describe the issue here]\n\n`);
    window.location.href = `mailto:info@edubridgepeople.com?subject=${subject}&body=${body}`;
    toast.info("Opening your email client...");
  };
  
  const handleDeletePost = async () => {
    if (!postToDelete || !user) return;
    const postIdToDelete = postToDelete.id;
    removePostFromState(postIdToDelete);
    setPostToDelete(null);
    try {
      const { error } = await supabase.from('posts').delete().match({ id: postIdToDelete, user_id: user.id });
      if (error) {
        fetchPosts();
        throw error;
      }
      toast.success('Post deleted.');
    } catch (error: any) { toast.error(error.message || 'Failed to delete post.'); }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setEditedContent(post.content || '');
    const foundUrl = post.content?.match(URL_REGEX);
    if (foundUrl) {
      setLoadingLinkPreview(true);
      fetchRichLinkPreview(foundUrl[0]).then(preview => {
        setLinkPreview(preview);
        setLoadingLinkPreview(false);
      });
    } else {
      setLinkPreview(null);
    }
  };

  const handleCancelEdit = () => { setEditingPost(null); setEditedContent(''); setLinkPreview(null); setLoadingLinkPreview(false); };

  const handleUpdatePost = async () => {
    if (!editingPost || !user) return;
    const foundUrl = editedContent.match(URL_REGEX);
    const updatedLinkUrl = foundUrl ? foundUrl[0] : null;

    updatePostInState(editingPost.id, {
        content: editedContent,
        link_url: updatedLinkUrl,
        link_title: linkPreview?.title || null,
        link_description: linkPreview?.description || null,
        link_image: linkPreview?.image || null,
    });
    handleCancelEdit();

    try {
      const { error } = await supabase.from('posts').update({
        content: editedContent,
        link_url: updatedLinkUrl,
        link_title: linkPreview?.title || null,
        link_description: linkPreview?.description || null,
        link_image: linkPreview?.image || null,
      }).match({ id: editingPost.id, user_id: user.id });
      if (error) {
        fetchPosts();
        throw error;
      }
      toast.success('Post updated.');
    } catch (error: any) { toast.error(error.message || 'Failed to update post.'); }
  };

  const toggleComments = (postId: string) => setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  const handleCommentChange = (postId: string, text: string) => setNewComments(prev => ({ ...prev, [postId]: text }));
  
  const handleClaimResourceClick = (post: Post) => {
      if (!user) {
          toast.error('You must be signed in to claim resources.');
          return;
      }
      if (profile?.role !== 'student') {
          toast.error('Only students can claim resources.');
          return;
      }
      if (profile.verification_status !== 'verified') {
          toast.error('You must be a verified student to claim resources. Please verify your profile.');
          router.push('/?page=verification');
          return;
      }
      setDonorDetails(post);
  };

  const isClaimButtonDisabled = (currentPost: Post) => {
    if (!user) return true;
    if (profile?.role !== 'student') return true;
    if (profile.verification_status !== 'verified') return true;
    if (currentPost.user_id === user.id) return true;
    return false;
  };

  const claimButtonTooltip = (currentPost: Post) => {
    if (!user) return "Sign in to claim resources";
    if (profile?.role !== 'student') return "Only students can claim resources";
    if (profile.verification_status !== 'verified') return "Verify your student profile to claim resources";
    if (currentPost.user_id === user.id) return "You cannot claim your own resource";
    return "Claim this resource";
  };


  return (
    <>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {user && profile && (
          <Card className="rounded-xl shadow-lg">
            <CardHeader className="p-4 sm:p-6 pb-0">
              <Tabs value={composerType} onValueChange={(value) => setComposerType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
                      <TabsTrigger value="wisdom" disabled={submitting} className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">Share Wisdom</TabsTrigger>
                      <TabsTrigger value="donation" disabled={submitting} className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">Donate Resource</TabsTrigger>
                      <TabsTrigger value="seeking" disabled={profile?.role !== 'student' || submitting} className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">Request Resource</TabsTrigger>
                  </TabsList>
                  <TabsContent value="wisdom" className="space-y-4 pt-4">
                    <Textarea placeholder="Share an insight, ask a question, or post a helpful link..." value={content} onChange={e => setContent(e.target.value)} disabled={submitting} className="min-h-[100px] border-gray-300 focus:border-blue-500"/>
                    {loadingLinkPreview && (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-500 mr-2" />
                            <span className="text-sm text-gray-500">Loading link preview...</span>
                        </div>
                    )}
                    {linkPreview && !loadingLinkPreview && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                        {linkPreview.image && (
                          <div className="relative w-full md:w-1/3 h-32 md:h-auto flex-shrink-0">
                            <Image
                              src={linkPreview.image}
                              alt="Link preview"
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="(max-width: 768px) 100vw, 33vw"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="p-3 flex-1">
                          <h4 className="font-semibold text-sm line-clamp-2">{linkPreview.title || linkPreview.url}</h4>
                          {linkPreview.description && <p className="text-xs text-gray-600 line-clamp-3 mt-1">{linkPreview.description}</p>}
                          <a href={linkPreview.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-2 block truncate">
                            {linkPreview.url}
                          </a>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="donation" className="space-y-4 pt-4">
                      <Input placeholder="Resource title (e.g., 'Programming Books')" value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} disabled={submitting} className="border-gray-300 focus:border-blue-500"/>
                      <Select value={resourceCategory} onValueChange={setResourceCategory} disabled={submitting}>
                        <SelectTrigger><SelectValue placeholder="Select donation category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="books">📚 Books & Study Materials</SelectItem>
                          <SelectItem value="electronics">💻 Electronics & Gadgets</SelectItem>
                          <SelectItem value="courses">🎓 Online Courses & Mentorship</SelectItem>
                          <SelectItem value="other">💡 Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Contact info (e.g., email or phone)" value={resourceContact} onChange={e => setResourceContact(e.target.value)} disabled={submitting} className="border-gray-300 focus:border-blue-500"/>
                  </TabsContent>
                  <TabsContent value="seeking" className="space-y-4 pt-4">
                      <Input placeholder="What resource do you need? (e.g., 'Financial aid for tuition')" value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} disabled={submitting} className="border-gray-300 focus:border-blue-500"/>
                      <Select value={resourceCategory} onValueChange={setResourceCategory} disabled={submitting}> {/* Corrected setCategory to setResourceCategory */}
                        <SelectTrigger><SelectValue placeholder="Select resource category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="books">📚 Books & Study Materials</SelectItem>
                          <SelectItem value="electronics">💻 Electronics & Gadgets</SelectItem>
                          <SelectItem value="courses">🎓 Online Courses & Mentorship</SelectItem>
                          <SelectItem value="other">💡 Other</SelectItem>
                        </SelectContent>
                      </Select>
                  </TabsContent>
              </Tabs>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <Label htmlFor="post-image-upload" className={`cursor-pointer text-blue-600 hover:text-blue-800 flex items-center ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <ImagePlus className="w-5 h-5 mr-1" /> Add Image
                    <Input id="post-image-upload" type="file" className="hidden" accept="image/*" onChange={e => setPostImageFile(e.target.files ? e.target.files[0] : null)} disabled={submitting}/>
                  </Label>
                  {postImageFile && <span className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-xs">{postImageFile.name}</span>}
                  <Button onClick={handlePostSubmit} disabled={submitting || (composerType === 'wisdom' && !content.trim()) || ((composerType === 'donation' || composerType === 'seeking') && (!resourceTitle.trim() || !resourceCategory)) || (composerType === 'donation' && !resourceContact.trim())}>
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-gray-500"/>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="wisdom">💡 Wisdom Posts</SelectItem>
                <SelectItem value="donation">🎁 Donations</SelectItem>
                <SelectItem value="seeking">🤝 Seeking Resources</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SortAsc className="w-4 h-4 mr-2 text-gray-500"/>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Most Recent</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
                <SelectItem value="comments">Most Commented</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {loading ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />) : (
          <div className="space-y-4">
              {filteredAndSortedPosts.length > 0 ? filteredAndSortedPosts.map((post) => (
                    <Card key={post.id} id={`post-${post.id}`} className="rounded-xl shadow-md">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-11 h-11"><AvatarImage src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.profiles?.username}&backgroundColor=6d28d9&radius=50`} alt={post.profiles?.username} /><AvatarFallback>{post.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                  <div className="flex items-center gap-2"><span className="font-semibold">{post.profiles?.username}</span>{(post.profiles?.role === 'donor' || post.profiles?.verification_status === 'verified') && <VerifiedBadge size={20} />}</div>
                                  <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                              </div>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 -mr-2"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      {user?.id === post.user_id ? (
                                          <><DropdownMenuItem onClick={() => handleEditClick(post)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem><DropdownMenuItem onClick={() => setPostToDelete(post)} className="text-red-600 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></>
                                      ) : (
                                        <>
                                            <DropdownMenuItem onClick={() => router.push(`/?page=messages&recipient=${post.profiles?.id}`)}><MessageCircle className="mr-2 h-4 w-4" />Message</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleReportPost(post.id)}><ShieldAlert className="mr-2 h-4 w-4" />Report</DropdownMenuItem>
                                        </>
                                      )}
                                  </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {editingPost?.id === post.id ? (
                              <div className="my-2">
                                <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="mb-2 border-gray-300 focus:border-blue-500"/>
                                {loadingLinkPreview && (
                                    <div className="flex items-center justify-center p-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading preview...
                                    </div>
                                )}
                                {linkPreview && !loadingLinkPreview && (
                                  <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row mb-2">
                                    {linkPreview.image && (
                                      <div className="relative w-full md:w-1/3 h-24 md:h-auto flex-shrink-0">
                                        <Image
                                          src={linkPreview.image}
                                          alt="Link preview"
                                          fill
                                          style={{ objectFit: 'cover' }}
                                          sizes="(max-width: 768px) 100vw, 33vw"
                                          unoptimized
                                        />
                                      </div>
                                    )}
                                    <div className="p-2 flex-1">
                                      <h4 className="font-semibold text-xs line-clamp-1">{linkPreview.title || linkPreview.url}</h4>
                                      {linkPreview.description && <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{linkPreview.description}</p>}
                                      <a href={linkPreview.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block truncate">
                                        {linkPreview.url}
                                      </a>
                                    </div>
                                  </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                    <Button size="sm" onClick={handleUpdatePost}>Save</Button>
                                </div>
                              </div>
                            ) : (
                                <>
                                    <p className="my-2 whitespace-pre-wrap text-gray-800">{post.content || post.resource_title}</p>
                                    {post.image_url && <Image src={post.image_url} alt="Post content" width={600} height={400} className="mt-2 rounded-lg max-h-96 w-full object-cover" unoptimized />}
                                    {post.link_url && (
                                      <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row mt-3 hover:shadow-md transition-shadow">
                                        {post.link_image && (
                                          <div className="relative w-full md:w-1/3 h-32 md:h-auto flex-shrink-0">
                                            <Image
                                              src={post.link_image}
                                              alt="Linked content image"
                                              fill
                                              style={{ objectFit: 'cover' }}
                                              sizes="(max-width: 768px) 100vw, 33vw"
                                              unoptimized
                                            />
                                          </div>
                                        )}
                                        <div className="p-3 flex-1">
                                          <h4 className="font-semibold text-base text-gray-900 line-clamp-2">{post.link_title || post.link_url}</h4>
                                          {post.link_description && <p className="text-sm text-gray-700 line-clamp-3 mt-1">{post.link_description}</p>}
                                          <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 flex items-center">
                                            <Link2 className="w-4 h-4 mr-1"/>
                                            {post.link_url}
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                </>
                            )}
                            {(post.post_type === 'donation' || post.post_type === 'seeking') && (
                                <div className="bg-blue-50 p-3 rounded-lg mt-3 space-y-2 border border-blue-200">
                                <div className="flex items-center text-sm font-medium">
                                  {post.resource_category === 'books' && <BookOpen className="w-4 h-4 mr-2 text-blue-600" />}
                                  {post.resource_category === 'electronics' && <Laptop className="w-4 h-4 mr-2 text-blue-600" />}
                                  {post.resource_category === 'courses' && <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />}
                                  {post.resource_category === 'other' && <CircleHelp className="w-4 h-4 mr-2 text-blue-600" />}
                                  Category: {post.resource_category}
                                </div>
                                {post.post_type === 'donation' &&
                                    <Button
                                        size="sm"
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleClaimResourceClick(post)}
                                        disabled={isClaimButtonDisabled(post)}
                                    >
                                      <Gift className="w-4 h-4 mr-2" />
                                      Claim Resource
                                    </Button>
                                }
                                <p className="text-xs text-gray-600 text-center">{claimButtonTooltip(post)}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between mt-4 text-gray-500 border-t pt-3 border-gray-100">
                                <Button variant="ghost" size="sm" onClick={() => handleLikeToggle(post)} disabled={!user} className="hover:bg-red-50 hover:text-red-600"><Heart className={`w-5 h-5 mr-1.5 ${post.likes?.some(l => l.user_id === user?.id) ? 'text-red-500 fill-current' : ''}`} />{post.likes?.length || 0}</Button>
                                <Button variant="ghost" size="sm" onClick={() => toggleComments(post.id)} className="hover:bg-blue-50 hover:text-blue-600"><MessageCircle className="w-5 h-5 mr-1.5" />{post.comments?.length || 0}</Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="hover:bg-purple-50 hover:text-purple-600"><Share2 className="w-5 h-5 mr-1.5" />Share</Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleShare('whatsapp', post)}><MessageSquareText className="w-4 h-4 mr-2"/>WhatsApp</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShare('twitter', post)}><Twitter className="w-4 h-4 mr-2"/>Twitter</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShare('copy', post)}><Copy className="w-4 h-4 mr-2"/>Copy Link</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {expandedComments[post.id] && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {user ? (
                                      <div className="flex space-x-2 items-center">
                                        <Input
                                          placeholder="Write a comment..."
                                          value={newComments[post.id] || ''}
                                          onChange={e => handleCommentChange(post.id, e.target.value)}
                                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(post.id); } }}
                                          className="flex-1 rounded-full px-4 py-2 border-gray-300 focus:border-blue-500"
                                        />
                                        <Button onClick={() => handleAddComment(post.id)} className="rounded-full h-10 w-10 p-0" disabled={!newComments[post.id]?.trim()}>
                                          <Send className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-center text-gray-500">Please sign in to comment.</p>
                                    )}
                                    <div className="mt-4 space-y-4">
                                      {post.comments?.map(comment => (
                                        <div key={comment.id} className="flex items-start space-x-2">
                                          <Avatar className="w-8 h-8 flex-shrink-0">
                                            <AvatarImage src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.profiles?.username}&backgroundColor=6d28d9&radius=50`} alt={comment.profiles?.username} />
                                            <AvatarFallback>{comment.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                          </Avatar>
                                          <div className={`flex-1 p-3 rounded-lg ${comment.user_id === user?.id ? 'bg-blue-50 text-blue-900 ml-auto rounded-br-none' : 'bg-gray-100 rounded-bl-none'}`}>
                                            <span className="font-semibold text-sm block">{comment.profiles?.username}</span>
                                            <p className="text-sm text-gray-800">{comment.content}</p>
                                            <span className="text-xs text-gray-500 block text-right mt-1">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              )) : (
                <p className="text-center text-gray-500 py-8">No posts found matching your criteria. Try adjusting filters or search query.</p>
              )}
          </div>
        )}
      </div>
      <AlertDialog open={postToDelete !== null} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete your post. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!donorDetails} onOpenChange={() => setDonorDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donor Contact Information</DialogTitle>
            <DialogDescription>Please contact the donor to coordinate receiving the resource.</DialogDescription>
          </DialogHeader>
          {donorDetails && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={donorDetails.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${donorDetails.profiles?.username}&backgroundColor=6d28d9&radius=50`} alt={donorDetails.profiles?.username} />
                  <AvatarFallback>{donorDetails.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg flex items-center gap-2">
                    {donorDetails.profiles?.username}
                    {(donorDetails.profiles?.role === 'donor' || donorDetails.profiles?.verification_status === 'verified') && <VerifiedBadge />}
                  </div>
                  <div className="text-sm text-gray-600">Generous Donor</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>{donorDetails.profiles?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span>{donorDetails.resource_contact}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
