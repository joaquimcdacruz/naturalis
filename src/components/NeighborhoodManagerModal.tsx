import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Search,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  Info,
  Layers,
  Percent,
  SlidersHorizontal,
  Navigation
} from 'lucide-react';
import { NeighborhoodFee } from '../types';
import { DEFAULT_NEIGHBORHOODS_DATA } from '../data/products';
import { formatCurrency } from '../utils/whatsapp';

interface NeighborhoodManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodFee[];
  onSaveNeighborhood: (neighborhood: NeighborhoodFee) => void;
  onDeleteNeighborhood: (neighborhoodId: string) => void;
  onDuplicateNeighborhood: (neighborhood: NeighborhoodFee) => void;
  onToggleNeighborhoodStatus?: (neighborhoodId: string) => void;
  onToggleStatus?: (neighborhoodId: string) => void;
  onQuickUpdateFee?: (neighborhoodId: string, newFee: number) => void;
  onBulkUpdateFees: (amount: number, isFixed?: boolean) => void;
  onResetToDefaults: () => void;
  onImportNeighborhoods?: (data: NeighborhoodFee[]) => void;
}

export const NeighborhoodManagerModal: React.FC<NeighborhoodManagerModalProps> = ({
  isOpen,
  onClose,
  neighborhoods,
  onSaveNeighborhood,
  onDeleteNeighborhood,
  onDuplicateNeighborhood,
  onToggleNeighborhoodStatus,
  onToggleStatus,
  onQuickUpdateFee,
  onBulkUpdateFees,
  onResetToDefaults,
  onImportNeighborhoods,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'fee_asc' | 'fee_desc' | 'time'>('fee_asc');

  // Edit / Create State
  const [editingNeighborhood, setEditingNeighborhood] = useState<NeighborhoodFee | null>(null);
  const [isNewNeighborhood, setIsNewNeighborhood] = useState(false);
  const [formName, setFormName] = useState('');
  const [formFee, setFormFee] = useState('6.00');
  const [formTime, setFormTime] = useState('30');
  const [formMinOrder, setFormMinOrder] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Bulk Adjustments State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState<string>('1.00');
  const [bulkMode, setBulkMode] = useState<'increase' | 'decrease' | 'fixed'>('increase');

  // Delete & Reset Confirmations
  const [neighborhoodToDelete, setNeighborhoodToDelete] = useState<NeighborhoodFee | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Backup / Import State
  const [isBackupSectionOpen, setIsBackupSectionOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = (id: string) => {
    if (onToggleNeighborhoodStatus) {
      onToggleNeighborhoodStatus(id);
    } else if (onToggleStatus) {
      onToggleStatus(id);
    }
  };

  const handleQuickStepFee = (n: NeighborhoodFee, delta: number) => {
    const newFee = Math.max(0, Number((n.fee + delta).toFixed(2)));
    if (onQuickUpdateFee) {
      onQuickUpdateFee(n.id || n.name, newFee);
    } else {
      onSaveNeighborhood({ ...n, fee: newFee });
    }
    showToast(`Taxa de "${n.name}" ajustada para ${formatCurrency(newFee)}`);
  };

  // Helper ID generator
  const getNeighborhoodKey = (n: NeighborhoodFee) => n.id || n.name;

  // Filtered and Sorted list
  const filteredNeighborhoods = useMemo(() => {
    return neighborhoods
      .filter((n) => {
        const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.notes && n.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const isActive = n.isActive !== false;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'fee_asc') return a.fee - b.fee;
        if (sortBy === 'fee_desc') return b.fee - a.fee;
        if (sortBy === 'time') return a.estimatedTimeMin - b.estimatedTimeMin;
        return 0;
      });
  }, [neighborhoods, searchQuery, statusFilter, sortBy]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = neighborhoods.length;
    const activeCount = neighborhoods.filter((n) => n.isActive !== false).length;
    const pausedCount = total - activeCount;
    const fees = neighborhoods.map((n) => n.fee);
    const minFee = fees.length > 0 ? Math.min(...fees) : 0;
    const maxFee = fees.length > 0 ? Math.max(...fees) : 0;
    const avgFee = fees.length > 0 ? fees.reduce((a, b) => a + b, 0) / fees.length : 0;
    const avgTime = neighborhoods.length > 0
      ? Math.round(neighborhoods.reduce((a, b) => a + (b.estimatedTimeMin || 30), 0) / neighborhoods.length)
      : 30;

    return { total, activeCount, pausedCount, minFee, maxFee, avgFee, avgTime };
  }, [neighborhoods]);

  if (!isOpen) return null;

  const handleOpenNew = () => {
    const newNeighborhood: NeighborhoodFee = {
      id: `bairro-${Date.now()}`,
      name: '',
      fee: 6.0,
      estimatedTimeMin: 30,
      isActive: true,
      minOrderValue: undefined,
      notes: '',
    };
    setEditingNeighborhood(newNeighborhood);
    setIsNewNeighborhood(true);
    setFormName('');
    setFormFee('6.00');
    setFormTime('30');
    setFormMinOrder('');
    setFormNotes('');
    setFormIsActive(true);
  };

  const handleOpenEdit = (n: NeighborhoodFee) => {
    setEditingNeighborhood(n);
    setIsNewNeighborhood(false);
    setFormName(n.name);
    setFormFee(String(n.fee));
    setFormTime(String(n.estimatedTimeMin || 30));
    setFormMinOrder(n.minOrderValue ? String(n.minOrderValue) : '');
    setFormNotes(n.notes || '');
    setFormIsActive(n.isActive !== false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNeighborhood) return;

    if (!formName.trim()) {
      alert('Por favor, informe o nome do bairro.');
      return;
    }

    const cleanFee = Math.max(0, parseFloat(formFee.replace(',', '.')) || 0);
    const cleanTime = Math.max(5, parseInt(formTime) || 30);
    const cleanMinOrder = formMinOrder.trim() ? Math.max(0, parseFloat(formMinOrder.replace(',', '.')) || 0) : undefined;
    const cleanId = editingNeighborhood.id || `bairro-${Date.now()}`;

    const toSave: NeighborhoodFee = {
      ...editingNeighborhood,
      id: cleanId,
      name: formName.trim(),
      fee: cleanFee,
      estimatedTimeMin: cleanTime,
      minOrderValue: cleanMinOrder,
      notes: formNotes.trim() || undefined,
      isActive: formIsActive,
    };

    onSaveNeighborhood(toSave);
    showToast(isNewNeighborhood ? 'Novo bairro adicionado com sucesso!' : 'Bairro atualizado com sucesso!');
    setEditingNeighborhood(null);
    setIsNewNeighborhood(false);
  };

  const handleApplyBulk = () => {
    const val = parseFloat(bulkAdjustmentValue.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      alert('Por favor, informe um valor numérico válido.');
      return;
    }

    if (bulkMode === 'increase') {
      onBulkUpdateFees(val, false);
      showToast(`Taxas de todos os bairros aumentadas em ${formatCurrency(val)}!`);
    } else if (bulkMode === 'decrease') {
      onBulkUpdateFees(-val, false);
      showToast(`Taxas de todos os bairros reduzidas em ${formatCurrency(val)}!`);
    } else if (bulkMode === 'fixed') {
      onBulkUpdateFees(val, true);
      showToast(`Taxa de todos os bairros definida para ${formatCurrency(val)}!`);
    }

    setIsBulkModalOpen(false);
  };

  const handleExportJson = () => {
    const exportData = {
      neighborhoods,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bairros_frete_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo JSON de bairros exportado com sucesso!');
  };

  const handleImportJson = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonText);
      const list = Array.isArray(parsed) ? parsed : parsed.neighborhoods;
      if (!Array.isArray(list) || list.length === 0) {
        setImportError('JSON inválido ou lista de bairros vazia.');
        return;
      }

      onImportNeighborhoods(list);
      showToast(`${list.length} bairros importados com sucesso!`);
      setImportJsonText('');
      setIsBackupSectionOpen(false);
    } catch {
      setImportError('Erro ao interpretar o arquivo JSON. Verifique a formatação.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200/90 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60 bg-stone-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900 tracking-tight">
                  Gerenciamento de Bairros & Frete
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                  {stats.activeCount} Ativos
                </span>
              </div>
              <p className="text-xs text-stone-500 font-normal">
                Configure zonas de atendimento, taxas personalizadas e prazos de entrega
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Cards Banner */}
        <div className="bg-stone-50/80 px-4 sm:px-6 py-3 border-b border-stone-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total de Bairros</span>
            <p className="text-base sm:text-lg font-black text-stone-900 mt-0.5">
              {stats.total}{' '}
              <span className="text-xs font-semibold text-stone-400">
                ({stats.activeCount} on / {stats.pausedCount} off)
              </span>
            </p>
          </div>

          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Taxa Média</span>
            <p className="text-base sm:text-lg font-black text-stone-900 mt-0.5">
              {formatCurrency(stats.avgFee)}
            </p>
          </div>

          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Faixa de Valores</span>
            <p className="text-base sm:text-lg font-black text-rose-600 mt-0.5">
              {formatCurrency(stats.minFee)} ~ {formatCurrency(stats.maxFee)}
            </p>
          </div>

          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tempo Médio</span>
            <p className="text-base sm:text-lg font-black text-stone-900 mt-0.5">
              ~{stats.avgTime} min
            </p>
          </div>
        </div>

        {/* Action Controls & Filter Bar */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search and Filters */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar bairro por nome ou observação..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Todos ({neighborhoods.length})</option>
              <option value="active">Ativos ({stats.activeCount})</option>
              <option value="inactive">Pausados ({stats.pausedCount})</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="hidden sm:block bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="fee_asc">Menor Taxa</option>
              <option value="fee_desc">Maior Taxa</option>
              <option value="name">Ordem Alfabética</option>
              <option value="time">Menor Tempo de Entrega</option>
            </select>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Ajustar todas as taxas de uma só vez"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
              <span>Ajuste em Lote</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNew}
              className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Bairro</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50">
          {!editingNeighborhood ? (
            <div className="space-y-4">
              {/* Neighborhoods Grid / List */}
              {filteredNeighborhoods.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-stone-800 text-sm">Nenhum bairro encontrado</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {searchQuery
                      ? 'Nenhum bairro corresponde à busca atual. Tente alterar o termo digitado.'
                      : 'Nenhum bairro cadastrado nesta listagem. Clique em "Novo Bairro" para começar.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenNew}
                    className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Primeiro Bairro</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredNeighborhoods.map((n) => {
                    const key = getNeighborhoodKey(n);
                    const isActive = n.isActive !== false;

                    return (
                      <div
                        key={key}
                        className={`p-4 bg-white rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                          isActive
                            ? 'border-stone-200/90 shadow-xs hover:border-stone-300'
                            : 'border-stone-200 bg-stone-50/70 opacity-75'
                        }`}
                      >
                        {/* Top Header info */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`font-extrabold text-sm truncate ${isActive ? 'text-stone-900' : 'text-stone-600 line-through'}`}>
                                {n.name}
                              </h4>
                              {n.fee === 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Grátis
                                </span>
                              )}
                            </div>

                            {n.notes && (
                              <p className="text-[11px] text-stone-500 font-normal line-clamp-1">
                                💬 {n.notes}
                              </p>
                            )}
                          </div>

                          {/* Status Switch button */}
                          <button
                            type="button"
                            onClick={() => {
                              handleToggle(key);
                              showToast(isActive ? `Entrega em "${n.name}" pausada.` : `Entrega em "${n.name}" ativada!`);
                            }}
                            className={`px-2 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                            }`}
                            title={isActive ? 'Clique para pausar entrega neste bairro' : 'Clique para ativar entrega neste bairro'}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                            <span>{isActive ? 'Ativo' : 'Pausado'}</span>
                          </button>
                        </div>

                        {/* Middle Delivery Metrics Badge */}
                        <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          <div>
                            <span className="text-[10px] font-bold text-stone-400 block uppercase">Taxa de Frete</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-sm font-black text-rose-600">
                                {n.fee === 0 ? 'Grátis' : formatCurrency(n.fee)}
                              </span>
                              <div className="flex items-center gap-0.5 ml-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickStepFee(n, -0.5);
                                  }}
                                  className="w-5 h-5 rounded-md bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[11px] font-black flex items-center justify-center cursor-pointer transition-colors"
                                  title="Diminuir R$ 0,50"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickStepFee(n, 0.5);
                                  }}
                                  className="w-5 h-5 rounded-md bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[11px] font-black flex items-center justify-center cursor-pointer transition-colors"
                                  title="Aumentar R$ 0,50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-400 block uppercase">Prazo Estimado</span>
                            <span className="text-xs font-bold text-stone-700 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>~{n.estimatedTimeMin || 30} min</span>
                            </span>
                          </div>
                          {n.minOrderValue && n.minOrderValue > 0 ? (
                            <div className="col-span-2 pt-1 border-t border-stone-200/60 text-[10px] text-amber-700 font-medium">
                              Pedido Mínimo exclusivo: <strong>{formatCurrency(n.minOrderValue)}</strong>
                            </div>
                          ) : null}
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-stone-100">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(n)}
                              className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-stone-500" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onDuplicateNeighborhood(n);
                                showToast(`Bairro "${n.name}" duplicado!`);
                              }}
                              className="p-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer transition-colors"
                              title="Duplicar configurações"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setNeighborhoodToDelete(n)}
                            className="p-1.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors"
                            title="Excluir bairro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Backup and Advanced Tools */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBackupSectionOpen(!isBackupSectionOpen)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <Layers className="w-3.5 h-3.5 text-stone-400" />
                    <span>Ferramentas de Backup & Importação de Bairros</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="text-xs text-stone-400 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar Lista Padrão</span>
                  </button>
                </div>

                {isBackupSectionOpen && (
                  <div className="mt-3 p-4 bg-white rounded-2xl border border-stone-200 space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">Backup & Compartilhamento de Bairros</h4>
                        <p className="text-[11px] text-stone-500">Exporte em arquivo .JSON ou cole dados para restaurar sua lista.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportJson}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar JSON</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block">
                        Importar Bairros a partir de JSON
                      </label>
                      <textarea
                        rows={3}
                        value={importJsonText}
                        onChange={(e) => setImportJsonText(e.target.value)}
                        placeholder='Cole aqui o JSON de bairros (ex: [{"name": "Centro", "fee": 5.00, "estimatedTimeMin": 25}])...'
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-mono text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      {importError && (
                        <p className="text-xs text-rose-600 font-semibold">{importError}</p>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleImportJson}
                          disabled={!importJsonText.trim()}
                          className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Importar e Salvar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* EDIT / CREATE NEIGHBORHOOD FORM SUBVIEW                     */
            /* ============================================================ */
            <form onSubmit={handleSaveForm} className="space-y-5 animate-in fade-in duration-200 max-w-2xl mx-auto bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">
                    {isNewNeighborhood ? 'Cadastrar Novo Bairro de Entrega' : `Editar Bairro: ${editingNeighborhood.name}`}
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    Defina o valor do frete, tempo estimado de envio e regras locais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingNeighborhood(null);
                    setIsNewNeighborhood(false);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Voltar
                </button>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Nome do Bairro / Região *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Centro, Setor Bueno, Jardim América, Zona Sul..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Delivery Fee */}
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Taxa de Entrega (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                        R$
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={formFee}
                        onChange={(e) => setFormFee(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-black text-rose-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-stone-400 font-medium">Atalhos:</span>
                      {[0, 5, 6, 7, 8, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormFee(String(val))}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold cursor-pointer transition-colors ${
                            parseFloat(formFee) === val
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {val === 0 ? 'Grátis' : `R$ ${val}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Delivery Time */}
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Tempo Estimado de Entrega (Minutos) *
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                    {/* Quick Time Presets */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-stone-400 font-medium">Atalhos:</span>
                      {[20, 30, 40, 50, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setFormTime(String(mins))}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold cursor-pointer transition-colors ${
                            parseInt(formTime) === mins
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Min Order Value for this neighborhood */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Pedido Mínimo Específico para este Bairro (Opcional - R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="Deixe em branco para usar o pedido mínimo padrão da loja"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Útil para bairros mais distantes que exigem valor mínimo maior.</p>
                </div>

                {/* Notes / Special delivery details */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Observações de Entrega ou Restrições (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ex: Entregas apenas a partir das 14h, ou consulte pelo WhatsApp"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Active Switch */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-900 block">
                      Disponibilidade de Entrega
                    </label>
                    <p className="text-[11px] text-stone-500 font-normal">
                      Quando desativado, o bairro não aparecerá como opção no checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      formIsActive
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {formIsActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Bairro Ativo</span>
                      </>
                    ) : (
                      <span>Pausado</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-100">
                {!isNewNeighborhood ? (
                  <button
                    type="button"
                    onClick={() => {
                      setNeighborhoodToDelete(editingNeighborhood);
                    }}
                    className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Bairro</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNeighborhood(null);
                      setIsNewNeighborhood(false);
                    }}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Bairro</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-stone-500 font-medium">
            {neighborhoods.length} bairros cadastrados • Todas as alterações são salvas automaticamente
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Fechar Painel
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: BULK ADJUSTMENT DIALOG                                */}
      {/* ============================================================ */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Ajuste de Taxas em Lote
                </h3>
                <p className="text-xs text-stone-500 font-normal">
                  Modifique o valor de frete de todos os {neighborhoods.length} bairros simultaneamente.
                </p>
              </div>
            </div>

            {/* Mode selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Tipo de Ajuste:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkMode('increase')}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    bulkMode === 'increase'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  + Aumentar
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMode('decrease')}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    bulkMode === 'decrease'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  - Reduzir
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMode('fixed')}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    bulkMode === 'fixed'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  = Fixar Valor
                </button>
              </div>
            </div>

            {/* Value input */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {bulkMode === 'fixed' ? 'Novo Valor Fixo para Todos (R$):' : 'Valor a somar/subtrair em cada taxa (R$):'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={bulkAdjustmentValue}
                  onChange={(e) => setBulkAdjustmentValue(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-black text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyBulk}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar a Todos os Bairros</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE CONFIRMATION                                   */}
      {/* ============================================================ */}
      {neighborhoodToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Excluir Bairro "{neighborhoodToDelete.name}"?
                </h3>
                <p className="text-xs text-stone-500 font-normal">
                  Taxa atual: {formatCurrency(neighborhoodToDelete.fee)}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Tem certeza que deseja remover este bairro? Ele deixará de ser exibido na lista de endereços para entrega no WhatsApp e Checkout.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setNeighborhoodToDelete(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const key = getNeighborhoodKey(neighborhoodToDelete);
                  const name = neighborhoodToDelete.name;
                  onDeleteNeighborhood(key);
                  if (editingNeighborhood && getNeighborhoodKey(editingNeighborhood) === key) {
                    setEditingNeighborhood(null);
                  }
                  setNeighborhoodToDelete(null);
                  showToast(`Bairro "${name}" excluído!`);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Bairro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: RESET CONFIRMATION                                    */}
      {/* ============================================================ */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Restaurar Bairros Padrão?
                </h3>
                <p className="text-xs text-stone-500 font-normal">
                  Reverte a lista para a configuração inicial da loja
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Esta ação substituirá todos os bairros e taxas customizados pela lista padrão original ({DEFAULT_NEIGHBORHOODS_DATA.length} bairros). Deseja continuar?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  setIsResetConfirmOpen(false);
                  showToast('Lista de bairros restaurada para o padrão!');
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sim, Restaurar Padrão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
