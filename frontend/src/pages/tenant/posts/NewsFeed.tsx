import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Image as ImageIcon,
  Pin,
  Megaphone,
  BarChart3,
  Smile,
  Send,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthService } from "@/contexts/AuthContextProvider";

// Types
type PostType = "post" | "announcement" | "poll";
type VisibilityType = "public" | "department" | "team" | "private";
type AttachmentType = "image" | "document" | "video";

interface PostUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface PostAttachment {
  id: number;
  type: AttachmentType;
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
}

interface PostReaction {
  id: number;
  userId: number;
  reaction: string;
  user: PostUser;
}

interface PostComment {
  id: number;
  userId: number;
  text: string;
  createdAt: string;
  user: PostUser;
  reactions: PostReaction[];
}

interface Post {
  id: number;
  userId: number;
  postType: PostType;
  text: string;
  attachments?: PostAttachment[];
  isEdited: boolean;
  isPinned: boolean;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  user: PostUser;
  reactions: PostReaction[];
  comments: PostComment[];
  commentCount: number;
  reactionCount: number;
  isBookmarked?: boolean;
  hashtags?: string[];
  mentions?: PostUser[];
}

// Dummy data generator
const generateDummyPosts = (): Post[] => {
  const users: PostUser[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "Product Manager",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sarah`,
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.c@example.com",
      role: "Software Engineer",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=michael`,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      role: "Design Lead",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=emily`,
    },
    {
      id: 4,
      name: "David Kumar",
      email: "david.k@example.com",
      role: "Marketing Director",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=david`,
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa.a@example.com",
      role: "HR Manager",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=lisa`,
    },
  ];

  const hashtags = [
    "#TeamWork",
    "#Innovation",
    "#Success",
    "#Culture",
    "#Tech",
  ];

  const posts: Post[] = [
    {
      id: 1,
      userId: 1,
      postType: "announcement",
      text: "🎉 Excited to announce our new product launch! We've been working hard on this for months and can't wait to share it with all of you. Check out the details in the link below!",
      attachments: [
        {
          id: 1,
          type: "image",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
        },
      ],
      isEdited: false,
      isPinned: true,
      visibility: "public",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: users[0],
      reactions: [
        {
          id: 1,
          userId: 2,
          reaction: "👍",
          user: users[1],
        },
        {
          id: 2,
          userId: 3,
          reaction: "❤️",
          user: users[2],
        },
        {
          id: 3,
          userId: 4,
          reaction: "🎉",
          user: users[3],
        },
      ],
      comments: [
        {
          id: 1,
          userId: 2,
          text: "This looks amazing! Can't wait to try it out.",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          user: users[1],
          reactions: [],
        },
      ],
      commentCount: 5,
      reactionCount: 23,
      hashtags: [hashtags[0], hashtags[1]],
    },
    {
      id: 2,
      userId: 2,
      postType: "post",
      text: "Just finished refactoring our authentication system. The new implementation is cleaner, more secure, and easier to maintain. #Tech",
      isEdited: false,
      isPinned: false,
      visibility: "public",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user: users[1],
      reactions: [
        {
          id: 4,
          userId: 1,
          reaction: "👍",
          user: users[0],
        },
        {
          id: 5,
          userId: 3,
          reaction: "🚀",
          user: users[2],
        },
      ],
      comments: [],
      commentCount: 0,
      reactionCount: 8,
      hashtags: [hashtags[4]],
    },
    {
      id: 3,
      userId: 3,
      postType: "poll",
      text: "What's your favorite design tool?",
      isEdited: false,
      isPinned: false,
      visibility: "public",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      user: users[2],
      reactions: [
        {
          id: 6,
          userId: 1,
          reaction: "👍",
          user: users[0],
        },
      ],
      comments: [],
      commentCount: 0,
      reactionCount: 12,
      hashtags: [],
    },
    {
      id: 4,
      userId: 4,
      postType: "post",
      text: "Had an amazing team building session today! Great to see everyone collaborating and having fun. These moments really strengthen our team culture. 📸",
      attachments: [
        {
          id: 2,
          type: "image",
          url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
        },
        {
          id: 3,
          type: "image",
          url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
        },
      ],
      isEdited: false,
      isPinned: false,
      visibility: "public",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      user: users[3],
      reactions: [
        {
          id: 7,
          userId: 1,
          reaction: "❤️",
          user: users[0],
        },
        {
          id: 8,
          userId: 2,
          reaction: "🎉",
          user: users[1],
        },
        {
          id: 9,
          userId: 5,
          reaction: "👍",
          user: users[4],
        },
      ],
      comments: [
        {
          id: 2,
          userId: 1,
          text: "Looks like an amazing time!",
          createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
          user: users[0],
          reactions: [],
        },
        {
          id: 3,
          userId: 2,
          text: "Thanks for organizing this!",
          createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          user: users[1],
          reactions: [],
        },
      ],
      commentCount: 2,
      reactionCount: 15,
      hashtags: [hashtags[3]],
    },
    {
      id: 5,
      userId: 5,
      postType: "announcement",
      text: "📢 Reminder: Team meeting scheduled for tomorrow at 2 PM. Please make sure to attend as we'll be discussing important quarterly goals.",
      isEdited: false,
      isPinned: false,
      visibility: "public",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: users[4],
      reactions: [
        {
          id: 10,
          userId: 1,
          reaction: "👍",
          user: users[0],
        },
      ],
      comments: [],
      commentCount: 0,
      reactionCount: 5,
      hashtags: [],
    },
  ];

  return posts;
};

// Format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Post Card Component
interface PostCardProps {
  post: Post;
  currentUserId: number;
  onReact: (postId: number) => void;
  onComment: (postId: number, text: string) => void;
  onBookmark: (postId: number) => void;
  onShare: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onReact,
  onComment,
  onBookmark,
  onShare,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [imageViewer, setImageViewer] = useState<string | null>(null);
  const hasReacted = post.reactions.some(r => r.userId === currentUserId);

  const handleReact = () => {
    onReact(post.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText.trim());
      setCommentText("");
    }
  };

  const getPostTypeIcon = () => {
    switch (post.postType) {
      case "announcement":
        return <Megaphone className="h-4 w-4" />;
      case "poll":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPostTypeColor = () => {
    switch (post.postType) {
      case "announcement":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "poll":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "";
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback>
                  {post.user.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {post.user.name}
                  </h3>
                  {post.postType !== "post" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs gap-1 flex items-center",
                        getPostTypeColor()
                      )}
                    >
                      {getPostTypeIcon()}
                      {post.postType}
                    </Badge>
                  )}
                  {post.isPinned && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {post.user.role && (
                    <>
                      <span>{post.user.role}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatTimeAgo(post.createdAt)}</span>
                  {post.isEdited && (
                    <>
                      <span>•</span>
                      <span>Edited</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Post Text */}
          {post.text && (
            <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
              {post.text}
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-accent"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div
              className={cn(
                "grid gap-2",
                post.attachments.length === 1
                  ? "grid-cols-1"
                  : post.attachments.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-2"
              )}
            >
              {post.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="relative group cursor-pointer rounded-lg overflow-hidden bg-muted aspect-video"
                  onClick={() =>
                    attachment.type === "image"
                      ? setImageViewer(attachment.url)
                      : null
                  }
                >
                  {attachment.type === "image" ? (
                    <img
                      src={attachment.thumbnailUrl || attachment.url}
                      alt={attachment.fileName || "Post attachment"}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Poll (if applicable) */}
          {post.postType === "poll" && (
            <div className="space-y-2 border rounded-lg p-4 bg-muted/50">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  Option 1
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  Option 2
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  Option 3
                </Button>
              </div>
            </div>
          )}

          {/* Reactions Summary */}
          {post.reactionCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {post.reactions.slice(0, 3).map((reaction, idx) => (
                  <span key={idx}>{reaction.reaction}</span>
                ))}
              </div>
              <span>{post.reactionCount}</span>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleReact}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  hasReacted && "fill-red-500 text-red-500"
                )}
              />
              <span className="hidden sm:inline">React</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comment</span>
              {post.commentCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {post.commentCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onShare(post.id)}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onBookmark(post.id)}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4",
                  post.isBookmarked && "fill-yellow-500 text-yellow-500"
                )}
              />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-3 pt-2">
              <Separator />
              {/* Existing Comments */}
              {post.comments.length > 0 && (
                <div className="space-y-3">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={comment.user.avatar}
                          alt={comment.user.name}
                        />
                        <AvatarFallback>
                          {comment.user.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <form onSubmit={handleComment} className="flex gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    {post.user.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="min-h-0 h-10 resize-none text-sm"
                    rows={1}
                  />
                  <Button type="submit" size="icon" className="h-10 w-10">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Viewer Modal */}
      {imageViewer && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setImageViewer(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setImageViewer(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={imageViewer}
              alt="Post image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Create Post Component
interface CreatePostProps {
  currentUser: PostUser;
  onCreatePost: (text: string, type: PostType) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({
  currentUser,
  onCreatePost,
}) => {
  const [text, setText] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onCreatePost(text.trim(), "post");
      setText("");
      setShowOptions(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>
              {currentUser.name
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-sm sm:text-base">
              {currentUser.name}
            </h3>
            {currentUser.role && (
              <p className="text-xs text-muted-foreground">
                {currentUser.role}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="What's on your mind?"
            value={text}
            onChange={e => setText(e.target.value)}
            className="min-h-[100px] resize-none text-sm sm:text-base"
            rows={4}
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowOptions(!showOptions)}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Photo</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!text.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Post</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Main Newsfeed Component
function NewsFeed() {
  const { loggedInUser } = useAuthService();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "announcements" | "posts">(
    "all"
  );

  // Initialize with dummy data
  React.useEffect(() => {
    setPosts(generateDummyPosts());
  }, []);

  const currentUser: PostUser = loggedInUser
    ? {
        id: loggedInUser.id,
        name: `${loggedInUser.firstName} ${loggedInUser.lastName}`.trim(),
        email: loggedInUser.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loggedInUser.email}`,
        role: "User",
      }
    : {
        id: 0,
        name: "Guest User",
        email: "guest@example.com",
        role: "Guest",
      };

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;
    if (filter === "announcements")
      return posts.filter(p => p.postType === "announcement");
    if (filter === "posts") return posts.filter(p => p.postType === "post");
    return posts;
  }, [posts, filter]);

  // Sort posts: pinned first, then by date
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredPosts]);

  const handleCreatePost = (text: string, type: PostType) => {
    const newPost: Post = {
      id: Date.now(),
      userId: currentUser.id,
      postType: type,
      text,
      isEdited: false,
      isPinned: false,
      visibility: "public",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: currentUser,
      reactions: [],
      comments: [],
      commentCount: 0,
      reactionCount: 0,
      hashtags: [],
    };
    setPosts([newPost, ...posts]);
  };

  const handleReact = (postId: number) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          const hasReacted = post.reactions.some(
            r => r.userId === currentUser.id
          );
          if (hasReacted) {
            return {
              ...post,
              reactions: post.reactions.filter(
                r => r.userId !== currentUser.id
              ),
              reactionCount: Math.max(0, post.reactionCount - 1),
            };
          } else {
            return {
              ...post,
              reactions: [
                ...post.reactions,
                {
                  id: Date.now(),
                  userId: currentUser.id,
                  reaction: "👍",
                  user: currentUser,
                },
              ],
              reactionCount: post.reactionCount + 1,
            };
          }
        }
        return post;
      })
    );
  };

  const handleComment = (postId: number, text: string) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: Date.now(),
                userId: currentUser.id,
                text,
                createdAt: new Date().toISOString(),
                user: currentUser,
                reactions: [],
              },
            ],
            commentCount: post.commentCount + 1,
          };
        }
        return post;
      })
    );
  };

  const handleBookmark = (postId: number) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return { ...post, isBookmarked: !post.isBookmarked };
        }
        return post;
      })
    );
  };

  const handleShare = (postId: number) => {
    // Handle share logic
    console.log("Share post", postId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Newsfeed</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Stay connected with your team
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="whitespace-nowrap"
          >
            All Posts
          </Button>
          <Button
            variant={filter === "posts" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("posts")}
            className="whitespace-nowrap"
          >
            Posts
          </Button>
          <Button
            variant={filter === "announcements" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("announcements")}
            className="whitespace-nowrap"
          >
            Announcements
          </Button>
        </div>

        {/* Create Post */}
        <CreatePost currentUser={currentUser} onCreatePost={handleCreatePost} />

        {/* Posts Feed */}
        <div className="space-y-6">
          {sortedPosts.length > 0 ? (
            sortedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                onReact={handleReact}
                onComment={handleComment}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewsFeed;
