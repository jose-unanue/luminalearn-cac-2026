import React, { useState } from 'react';
import { Volume2, Send, Flag, ArrowLeft } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { DISCUSSION_SENTENCE_STARTERS } from '../data/curriculumData';

export default function CommunityDiscussions() {
  const {
    returnToStudentLearning,
    allLessons,
    discussions,
    addDiscussionPost,
    addDiscussionReply,
    reportDiscussionPost,
    speakText
  } = usePlatform();

  const [selectedLessonId, setSelectedLessonId] = useState(
    allLessons[0]?.id || 'elem-math-fractions'
  );
  const [postContent, setPostContent] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});

  const visibleDiscussions = discussions.filter(
    (d) => d.moderationStatus !== 'hidden'
  );

  const handlePublishPost = (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    addDiscussionPost({
      lessonId: selectedLessonId,
      promptTag: 'Study Note',
      content: postContent.trim(),
      role: 'student'
    });
    setPostContent('');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="surface-card rounded-3xl bg-white border-2 border-indigo-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 font-bold text-xs">
              Optional Class Study Community
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Class Discussion & Study Notes
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Click any <strong>Sentence Starter</strong> below to share a study tip or question, or read classmates’ notes.
            </p>
          </div>
          <button
            type="button"
            onClick={returnToStudentLearning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Return to learning
          </button>
        </div>

        {/* 1-Click Sentence Starters */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-indigo-800">
            1-Click Sentence Starters:
          </div>
          <div className="flex flex-wrap gap-2">
            {DISCUSSION_SENTENCE_STARTERS.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPostContent(starter + ' ')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold transition"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handlePublishPost} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block sm:col-span-1">
              <span className="font-bold text-slate-700 uppercase">Lesson Topic:</span>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
              >
                {allLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="font-bold text-slate-700 uppercase">Your Note or Question:</span>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Pick a sentence starter above or type your note..."
                  className="flex-1 rounded-xl border-2 border-slate-300 px-3.5 py-2 text-slate-900 font-medium"
                />
                <button
                  type="submit"
                  disabled={!postContent.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </label>
          </div>
        </form>
      </div>

      {/* Discussion Threads */}
      <div className="space-y-4">
        {visibleDiscussions.map((post) => {
          const linkedLesson = allLessons.find((l) => l.id === post.lessonId);
          return (
            <div
              key={post.id}
              className="surface-card bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xl">
                    {post.avatar}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {post.author}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                        {post.promptTag}
                      </span>
                      {linkedLesson && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          📚 {linkedLesson.title}
                        </span>
                      )}
                      {post.moderationStatus === 'flagged' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                          Pending Teacher Review
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{post.timestamp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      speakText(`${post.author} says: ${post.content}`, 'Discussion Reader')
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Read aloud
                  </button>
                  <button
                    type="button"
                    onClick={() => reportDiscussionPost(post.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 text-xs font-semibold"
                    title="Ask a teacher to review this post"
                  >
                    <Flag className="w-3.5 h-3.5" /> Review
                  </button>
                </div>
              </div>

              <p className="text-sm md:text-base text-slate-800 leading-relaxed">
                {post.content}
              </p>

              {post.replies && post.replies.length > 0 && (
                <div className="pl-4 border-l-2 border-indigo-200 space-y-2.5">
                  {post.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {rep.avatar} {rep.author} •{' '}
                          <span className="text-slate-500 font-normal">{rep.timestamp}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakText(`${rep.author} replied: ${rep.content}`, 'Reply Reader')
                          }
                          className="text-indigo-700 font-bold hover:underline"
                        >
                          🔊 Read
                        </button>
                      </div>
                      <p className="text-slate-700 text-xs md:text-sm">{rep.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={replyDrafts[post.id] || ''}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                  }
                  placeholder="Write an encouraging reply..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    addDiscussionReply(post.id, replyDrafts[post.id] || '');
                    setReplyDrafts((prev) => ({ ...prev, [post.id]: '' }));
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
