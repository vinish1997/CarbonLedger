import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { api } from '../utils/api';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

/** --- HELPER FUNCTIONS --- */
const getCategoryColor = (cat) => {
  switch (cat?.toUpperCase()) {
    case 'TRANSPORTATION': return '#34d399';
    case 'DIET': return '#60a5fa';
    case 'ENERGY': return '#fbbf24';
    case 'CONSUMPTION': return '#ef4444';
    default: return '#f87171';
  }
};

/** --- CUSTOM HOOK FOR LOGIC --- */
const useHistoryLogic = (triggerRefresh) => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(page, 8); // Load 8 items per page
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load history logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, triggerRefresh]);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  return { 
    logs, page, totalPages, totalElements, loading, 
    handleNextPage, handlePrevPage 
  };
};

/** --- SUB-COMPONENTS --- */
const HistoryRow = React.memo(({ log }) => {
  const categoryColor = getCategoryColor(log.category);
  
  return (
    <tr style={{ borderBottom: '1px solid var(--border-glass)', transition: 'var(--transition-smooth)' }} className="table-row">
      <td style={{ padding: '18px 24px', fontWeight: '500' }}>{log.actionName}</td>
      <td style={{ padding: '18px 24px' }}>
        <span 
          style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            color: categoryColor, 
            background: `${categoryColor}15`, 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontWeight: '700', 
            border: `1px solid ${categoryColor}20` 
          }}
        >
          {log.category}
        </span>
      </td>
      <td style={{ padding: '18px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={14} color="var(--text-muted)" />
          {log.dateLogged}
        </div>
      </td>
      <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: '600', color: 'var(--primary)' }}>
        -{log.carbonSaving} kg CO2e
      </td>
    </tr>
  );
});

HistoryRow.propTypes = {
  log: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    actionName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    dateLogged: PropTypes.string.isRequired,
    carbonSaving: PropTypes.number.isRequired,
  }).isRequired
};
HistoryRow.displayName = 'HistoryRow';

/** --- MAIN COMPONENT --- */
export default function History({ triggerRefresh }) {
  const { 
    logs, page, totalPages, totalElements, loading, 
    handleNextPage, handlePrevPage 
  } = useHistoryLogic(triggerRefresh);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Action History</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detailed record of all logged actions and completed challenges.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Logged History Logs</span>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total: {totalElements} actions</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            Retrieving details...
          </div>
        ) : logs.length > 0 ? (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Action Name</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date Logged</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Carbon Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <HistoryRow key={log.id || index} log={log} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '8px 12px' }}
                    onClick={handlePrevPage}
                    disabled={page === 0}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '8px 12px' }}
                    onClick={handleNextPage}
                    disabled={page === totalPages - 1}
                    aria-label="Next page"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No actions logged yet. Start saving carbon!
          </div>
        )}
      </div>
    </div>
  );
}

History.propTypes = {
  triggerRefresh: PropTypes.any
};
