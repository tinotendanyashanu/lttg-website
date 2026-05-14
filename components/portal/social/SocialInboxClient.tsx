'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CalendarClock, Facebook, ImagePlus, Instagram, Link as LinkIcon, Loader2, Paperclip, RefreshCw, Send, UploadCloud } from 'lucide-react';
import type { SocialConversation, SocialMessage, SocialPlatform, SocialPost, SocialPostStatus } from '@/lib/types/social';
import {
  createSocialPost,
  fetchSocialConversations,
  fetchSocialMessages,
  fetchSocialPosts,
  sendSocialMessage,
} from '@/lib/services/social-api';

interface SocialInboxClientProps {
  userId: string;
  role: 'admin' | 'employee';
}

function platformStyle(platform: SocialPlatform) {
  return platform === 'instagram'
    ? 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/30 dark:text-pink-200 dark:border-pink-900'
    : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900';
}

function PlatformIcon({ platform, className = 'h-4 w-4' }: { platform: SocialPlatform; className?: string }) {
  return platform === 'instagram' ? <Instagram className={className} /> : <Facebook className={className} />;
}

export default function SocialInboxClient({ userId, role }: SocialInboxClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform | 'all'>('all');
  const [conversations, setConversations] = useState<SocialConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [compose, setCompose] = useState('');
  const [sending, setSending] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [postPlatform, setPostPlatform] = useState<SocialPlatform>('facebook');
  const [postStatus, setPostStatus] = useState<SocialPostStatus>('draft');
  const [postContent, setPostContent] = useState('');
  const [postSchedule, setPostSchedule] = useState('');
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const canReply = useMemo(() => {
    if (!selected) return false;
    return role === 'admin' || selected.assigned_to === userId;
  }, [role, selected, userId]);

  const loadToken = useCallback(async () => {
    const res = await fetch('/api/mail/token');
    if (!res.ok) {
      setBanner(res.status === 403 ? 'Social inbox is available to employees only.' : 'Could not authorize social inbox.');
      return null;
    }
    const json = (await res.json()) as { token: string };
    setToken(json.token);
    return json.token;
  }, []);

  const refreshConversations = useCallback(async () => {
    const t = token ?? (await loadToken());
    if (!t) return;
    setLoadingList(true);
    try {
      const list = await fetchSocialConversations(t, platform === 'all' ? undefined : platform);
      setConversations(list);
      if (!selectedId && list[0]) setSelectedId(list[0].id);
      setBanner(null);
    } catch {
      setBanner('Could not load social conversations. Check backend social routes and Meta configuration.');
    } finally {
      setLoadingList(false);
    }
  }, [loadToken, platform, selectedId, token]);

  const refreshMessages = useCallback(async () => {
    if (!selectedId) return;
    const t = token ?? (await loadToken());
    if (!t) return;
    setLoadingMessages(true);
    try {
      const data = await fetchSocialMessages(t, selectedId);
      setMessages(data.items);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch {
      setBanner('Could not load this social conversation.');
    } finally {
      setLoadingMessages(false);
    }
  }, [loadToken, selectedId, token]);

  const refreshPosts = useCallback(async () => {
    const t = token ?? (await loadToken());
    if (!t) return;
    try {
      setPosts(await fetchSocialPosts(t));
    } catch {
      setBanner('Could not load social posts.');
    }
  }, [loadToken, token]);

  useEffect(() => {
    void loadToken();
  }, [loadToken]);

  useEffect(() => {
    if (token) void refreshConversations();
  }, [platform, refreshConversations, token]);

  useEffect(() => {
    if (token) void refreshPosts();
  }, [refreshPosts, token]);

  useEffect(() => {
    if (selectedId) void refreshMessages();
  }, [refreshMessages, selectedId]);

  useEffect(() => {
    const id = setInterval(() => {
      void refreshConversations();
      void refreshMessages();
    }, 30_000);
    return () => clearInterval(id);
  }, [refreshConversations, refreshMessages]);

  const handleSend = async () => {
    if (!selectedId || !compose.trim() || sending) return;
    const t = token ?? (await loadToken());
    if (!t) return;
    setSending(true);
    try {
      await sendSocialMessage(t, { conversationId: selectedId, content: compose.trim() });
      setCompose('');
      await refreshMessages();
      await refreshConversations();
    } catch {
      setBanner('Send failed. Confirm the Page is connected and Meta message permissions are approved.');
    } finally {
      setSending(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || posting) return;
    const t = token ?? (await loadToken());
    if (!t) return;
    setPosting(true);
    try {
      await createSocialPost(t, {
        platform: postPlatform,
        content: postContent.trim(),
        status: postStatus,
        scheduledTime: postSchedule || undefined,
        files: postFiles,
      });
      setPostContent('');
      setPostFiles([]);
      setPostSchedule('');
      await refreshPosts();
      setBanner(postStatus === 'published' ? 'Post published.' : 'Post saved.');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('social_account_not_connected')) {
        setBanner('Post failed. Meta account for this platform is not connected.');
      } else if (msg.includes('instagram_media_required')) {
        setBanner('Post failed. Instagram posts require at least one image or video.');
      } else if (msg.includes('400')) {
        setBanner('Post failed. Please check your content and scheduled time.');
      } else {
        setBanner('Post failed. Confirm Meta permissions and platform requirements.');
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="h-full min-h-[calc(100vh-8rem)] grid grid-cols-1 xl:grid-cols-[minmax(280px,360px)_1fr_minmax(300px,380px)] gap-4">
      <section className="bg-white dark:bg-[#202024] border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col min-h-[520px]">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-950 dark:text-white">Social Inbox</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Assigned Instagram and Facebook messages</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/social/connect"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              title="Connect Meta"
            >
              <LinkIcon className="h-4 w-4" />
            </a>
            <button
              onClick={() => void refreshConversations()}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              title="Refresh conversations"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-3 flex gap-2 border-b border-gray-100 dark:border-gray-800">
          {(['all', 'instagram', 'facebook'] as const).map((value) => (
            <button
              key={value}
              onClick={() => setPlatform(value)}
              className={`h-9 flex-1 rounded-md text-xs font-semibold border transition-colors ${
                platform === value
                  ? 'bg-gray-950 text-white border-gray-950 dark:bg-white dark:text-gray-950 dark:border-white'
                  : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {value === 'all' ? 'All' : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="h-40 flex items-center justify-center text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
              No assigned social conversations yet. New Meta webhook messages will appear here.
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                  selectedId === conversation.id ? 'bg-gray-50 dark:bg-gray-800/70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                    {conversation.profile_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={conversation.profile_image_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <PlatformIcon platform={conversation.platform} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-950 dark:text-white truncate">{conversation.client_name}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${platformStyle(conversation.platform)}`}>
                        <PlatformIcon platform={conversation.platform} className="h-3 w-3" />
                        {conversation.platform}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{conversation.last_message || 'No message preview'}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{conversation.case_id}</span>
                      <span>
                        {conversation.updated_at ? formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true }) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="bg-white dark:bg-[#202024] border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col min-h-[520px]">
        {selected ? (
          <>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-950 dark:text-white truncate">{selected.client_name}</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${platformStyle(selected.platform)}`}>
                    <PlatformIcon platform={selected.platform} className="h-3 w-3" />
                    {selected.platform}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Linked case {selected.case_id}</p>
              </div>
            </div>

            {banner && (
              <div className="mx-5 mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                {banner}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingMessages ? (
                <div className="h-40 flex items-center justify-center text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                messages.map((message) => {
                  const isEmployee = message.sender_type === 'employee';
                  return (
                    <div key={message.id} className={`flex ${isEmployee ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-lg px-4 py-3 text-sm shadow-sm ${
                        isEmployee
                          ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <a
                                key={`${attachment.url}-${index}`}
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-md bg-white/10 px-2 py-1 text-xs underline-offset-2 hover:underline"
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                                {attachment.filename || attachment.content_type}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className={`mt-2 text-[10px] ${isEmployee ? 'text-white/65 dark:text-gray-600' : 'text-gray-500'}`}>
                          {message.timestamp ? new Date(message.timestamp).toLocaleString() : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-end gap-2">
                <textarea
                  value={compose}
                  onChange={(event) => setCompose(event.target.value)}
                  disabled={!canReply}
                  rows={2}
                  className="min-h-12 flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 disabled:opacity-60"
                  placeholder={canReply ? 'Reply to this social conversation...' : 'Only assigned employees can reply'}
                />
                <button
                  onClick={handleSend}
                  disabled={!compose.trim() || sending || !canReply}
                  className="h-12 w-12 inline-flex items-center justify-center rounded-lg bg-gray-950 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
                  title="Send reply"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Select a conversation to view the message history.
          </div>
        )}
      </section>

      <aside className="bg-white dark:bg-[#202024] border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col min-h-[520px]">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-950 dark:text-white">Posts</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Draft, schedule, or publish to connected accounts</p>
        </div>

        <div className="p-4 space-y-3 border-b border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-2">
            {(['facebook', 'instagram'] as SocialPlatform[]).map((value) => (
              <button
                key={value}
                onClick={() => setPostPlatform(value)}
                className={`h-10 rounded-md border text-xs font-semibold inline-flex items-center justify-center gap-2 ${postPlatform === value ? platformStyle(value) : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                <PlatformIcon platform={value} />
                {value}
              </button>
            ))}
          </div>
          <textarea
            value={postContent}
            onChange={(event) => setPostContent(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
            placeholder="Write a post..."
          />
          <div className="grid grid-cols-3 gap-2">
            {(['draft', 'scheduled', 'published'] as SocialPostStatus[]).map((value) => (
              <button
                key={value}
                onClick={() => setPostStatus(value)}
                className={`h-9 rounded-md border text-xs font-semibold ${postStatus === value ? 'bg-gray-950 text-white border-gray-950 dark:bg-white dark:text-gray-950 dark:border-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                {value}
              </button>
            ))}
          </div>
          {postStatus === 'scheduled' && (
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
              <CalendarClock className="h-4 w-4 text-gray-400" />
              <input
                type="datetime-local"
                value={postSchedule}
                onChange={(event) => setPostSchedule(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white"
              />
            </label>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-3 py-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
            <ImagePlus className="h-4 w-4" />
            <span>{postFiles.length ? `${postFiles.length} media file(s)` : 'Attach media'}</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(event) => setPostFiles(Array.from(event.target.files ?? []))}
            />
          </label>
          <button
            onClick={handleCreatePost}
            disabled={!postContent.trim() || posting}
            className="h-10 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Save Post
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {posts.length === 0 ? (
            <p className="p-3 text-sm text-gray-500 dark:text-gray-400">No posts created yet.</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${platformStyle(post.platform)}`}>
                    <PlatformIcon platform={post.platform} className="h-3 w-3" />
                    {post.platform}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">{post.status}</span>
                </div>
                <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 line-clamp-4">{post.content}</p>
                {post.media_urls.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">{post.media_urls.length} media attachment(s)</p>
                )}
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
