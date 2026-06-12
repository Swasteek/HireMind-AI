// WHY skeletons?
// Plain "Loading..." text is jarring. Skeletons show the shape of
// the content before it loads — reduces perceived wait time significantly.
// Every major product (LinkedIn, Facebook, GitHub) uses this pattern.

const SkeletonBlock = ({ className = '' }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export const CardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                <SkeletonBlock className="h-4 w-48 mb-2" />
                <SkeletonBlock className="h-3 w-32" />
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="h-2 w-full mt-4 rounded-full" />
        <div className="flex gap-2 mt-3">
            <SkeletonBlock className="h-5 w-16 rounded-md" />
            <SkeletonBlock className="h-5 w-20 rounded-md" />
            <SkeletonBlock className="h-5 w-14 rounded-md" />
        </div>
    </div>
);

export const CardListSkeleton = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

export const DetailSkeleton = () => (
    <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <SkeletonBlock className="h-6 w-48 mb-2" />
                    <SkeletonBlock className="h-4 w-36 mb-1" />
                    <SkeletonBlock className="h-3 w-52" />
                </div>
                <SkeletonBlock className="h-12 w-16 rounded-lg" />
            </div>
            <SkeletonBlock className="h-3 w-24 mb-2" />
            <div className="flex gap-2">
                <SkeletonBlock className="h-8 w-20 rounded-lg" />
                <SkeletonBlock className="h-8 w-20 rounded-lg" />
                <SkeletonBlock className="h-8 w-24 rounded-lg" />
                <SkeletonBlock className="h-8 w-16 rounded-lg" />
            </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <SkeletonBlock className="h-4 w-32 mb-4" />
            <SkeletonBlock className="h-3 w-full mb-2" />
            <SkeletonBlock className="h-3 w-5/6 mb-2" />
            <SkeletonBlock className="h-3 w-4/6 mb-6" />
            <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-6 w-16 rounded-md" />
                ))}
            </div>
        </div>
    </div>
);

export const StatsSkeleton = () => (
    <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <SkeletonBlock className="h-8 w-12 mx-auto mb-2" />
                <SkeletonBlock className="h-3 w-20 mx-auto" />
            </div>
        ))}
    </div>
);

export const InterviewSkeleton = () => (
    <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                    <SkeletonBlock className="h-6 w-6 rounded-full" />
                    <SkeletonBlock className="h-5 w-20 rounded-full" />
                </div>
                <SkeletonBlock className="h-4 w-full mb-2" />
                <SkeletonBlock className="h-4 w-4/5 mb-4" />
                <SkeletonBlock className="h-24 w-full rounded-lg" />
            </div>
        ))}
    </div>
);