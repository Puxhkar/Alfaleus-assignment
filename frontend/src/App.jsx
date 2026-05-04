import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NewsCluster from './components/NewsCluster';
import LoadingSkeleton from './components/LoadingSkeleton';
import SubscribeModal from './components/SubscribeModal';
import DashboardMetrics from './components/DashboardMetrics';
import SidebarFilters from './components/SidebarFilters';
import TrendingStories from './components/TrendingStories';
import AIInsightsPanel from './components/AIInsightsPanel';
import AnalyticsPage from './pages/AnalyticsPage';
import { fetchDigest, fetchTopics, triggerRefresh } from './services/api';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

let toastId = 0;
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast" onClick={() => onDismiss(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [clusters, setClusters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSource, setActiveSource] = useState('all');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Data
  const [lastUpdated, setLastUpdated] = useState(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalClusters, setTotalClusters] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1 && !isRefresh) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);
      setError('');

      const [digestData, topicsData] = await Promise.all([
        fetchDigest({ page: pageNum, limit: 10 }),
        pageNum === 1 ? fetchTopics() : Promise.resolve({ topics: [] })
      ]);

      if (pageNum === 1) {
        setClusters(digestData.clusters || []);
      } else {
        setClusters(prev => [...prev, ...(digestData.clusters || [])]);
      }

      setLastUpdated(digestData.lastUpdated);
      setTotalArticles(digestData.totalArticles || 0);
      setTotalClusters(digestData.totalClusters || 0);
      setHasMore(digestData.hasMore);
      setPage(pageNum);

      if (pageNum === 1 && topicsData.topics) {
        setTopics(topicsData.topics || []);
      }

      if (isRefresh) {
        addToast(`✓ Digest refreshed — ${digestData.totalArticles || 0} articles`);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load news digest. Make sure the backend is running.');
      if (isRefresh) addToast('⚠ Refresh failed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    const id = setInterval(() => loadData(1, true), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        loadData(1, false);
      }
    }, 0);
    return () => { isMounted = false; };
  }, [loadData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      setTimeout(() => loadData(1, true), 2000);
      addToast('⟳ Fetching latest news…');
    } catch {
      addToast('⚠ Manual refresh failed');
      setRefreshing(false);
    }
  };

  const allSources = useMemo(() => {
    const s = new Set();
    clusters.forEach(c => (c.sources || []).forEach(src => s.add(src)));
    return Array.from(s).sort();
  }, [clusters]);

  const filteredClusters = useMemo(() => {
    let result = clusters;

    if (showBookmarks) {
      try {
        const saved = JSON.parse(localStorage.getItem('news_bookmarks') || '[]');
        result = result.filter(c => c.articles.some(a => saved.includes(a.url)));
      } catch {
        result = [];
      }
    }

    if (activeFilter !== 'all') {
      const q = activeFilter.toLowerCase();
      result = result.filter((c) =>
        c.clusterTopic?.toLowerCase() === q ||
        c.articles?.some(a =>
          Array.isArray(a.topics) && a.topics.some(t => t.toLowerCase() === q)
        )
      );
    }

    if (activeSource !== 'all') {
      result = result.filter((c) => (c.sources || []).includes(activeSource));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => {
        if (c.clusterTopic?.toLowerCase().includes(q)) return true;
        return c.articles?.some((a) =>
          (a.headline || a.title)?.toLowerCase().includes(q) ||
          (a.summary)?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [clusters, activeFilter, activeSource, searchQuery, showBookmarks]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        lastUpdated={lastUpdated}
        onSubscribeClick={() => setShowSubscribeModal(true)}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
      />

      <Routes>
        <Route path="/" element={
          <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 28px 80px' }}>

            {/* Metrics strip */}
            {!loading && !error && (
              <DashboardMetrics
                totalArticles={totalArticles}
                totalClusters={totalClusters}
                clusters={clusters}
              />
            )}

            {/* 2-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

              {/* Left sidebar */}
              <aside>
                <div style={{ position: 'sticky', top: '90px' }}>
                  <SidebarFilters
                    topics={topics}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    sources={allSources}
                    activeSource={activeSource}
                    onSourceChange={setActiveSource}
                    showBookmarks={showBookmarks}
                    onToggleBookmarks={() => setShowBookmarks(!showBookmarks)}
                  />
                </div>
              </aside>

              {/* Main feed */}
              <div style={{ minWidth: 0 }}>

                {/* Search */}
                <div style={{ marginBottom: '20px' }}>
                  <SearchBar value={searchQuery} onChange={setSearchQuery} resultCount={filteredClusters.length} />
                </div>

                {/* Trending */}
                {!loading && !error && !searchQuery && activeFilter === 'all' && !showBookmarks && (
                  <TrendingStories clusters={clusters} onSelectCluster={setSelectedCluster} />
                )}

                {/* Feed */}
                {loading ? (
                  <LoadingSkeleton />
                ) : error ? (
                  <div className="sketch-panel" style={{ padding: '52px 32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '44px', marginBottom: '14px' }}>📡</div>
                    <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', marginBottom: '8px' }}>Unable to Load Feed</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
                    <button className="sketch-btn primary" onClick={() => loadData(1, false)}>Retry Connection</button>
                  </div>
                ) : filteredClusters.length === 0 ? (
                  <div className="sketch-panel" style={{ padding: '52px 32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                    <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '15px' }}>No stories match this filter.</p>
                    <button className="sketch-btn" style={{ marginTop: '16px' }} onClick={() => setActiveFilter('all')}>Clear Filter</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {filteredClusters.map((cluster, i) => (
                      <NewsCluster
                        key={cluster.id || i}
                        cluster={cluster}
                        index={i}
                        isActive={selectedCluster?.id === cluster.id}
                        onSelect={setSelectedCluster}
                        defaultExpanded={i === 0}
                      />
                    ))}

                    {hasMore && !searchQuery && activeFilter === 'all' && !showBookmarks && (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 24px' }}>
                        <button className="sketch-btn" onClick={() => loadData(page + 1, false)} disabled={loadingMore}>
                          {loadingMore ? '⏳ Loading…' : '↓ Load More Stories'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        } />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>

      {/* AI Insights floating panel when cluster selected */}
      {selectedCluster && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '360px', zIndex: 200,
          animation: 'slideUp 0.25s ease-out',
        }}>
          <AIInsightsPanel cluster={selectedCluster} onClose={() => setSelectedCluster(null)} />
        </div>
      )}

      {showSubscribeModal && <SubscribeModal topics={topics} onClose={() => setShowSubscribeModal(false)} />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
