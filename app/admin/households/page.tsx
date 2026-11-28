"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Search,
  ChevronDown,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  Lock,
} from "lucide-react";

type HouseholdRow = {
  id: string;
  unit: string;
  building: string;
  resident: string;
  contact: string;
  balance: number;
  status: string;
  slot: string;
};

export default function HouseholdDirectory() {
  const router = useRouter();

  // 1. INTERACTIVE STATE
  const initialHouseholds = [
    { id: '1', unit: 'A-101', building: 'Maple Court', resident: 'Adrian Lleva', contact: 'adrian.lleva@example.com', balance: 0.00, status: 'Current', slot: 'P-01' },
    { id: '2', unit: 'A-102', building: 'Maple Court', resident: 'Owen Clarke', contact: 'owen.clarke@example.com', balance: 0.00, status: 'Current', slot: 'P-02' },
    { id: '3', unit: 'A-103', building: 'Oak Court', resident: 'Iris Chen', contact: 'iris.chen@example.com', balance: 120.00, status: 'Payment pending', slot: 'P-03' },
    { id: '4', unit: 'B-201', building: 'Pine Court', resident: 'Leo Santos', contact: 'leo.santos@example.com', balance: 0.00, status: 'Current', slot: '—' },
    { id: '5', unit: 'B-202', building: 'Pine Court', resident: 'Eva Martin', contact: 'eva.martin@example.com', balance: 120.00, status: 'Payment pending', slot: 'P-04' },
    { id: '6', unit: 'B-203', building: 'Pine Court', resident: 'Nina Shah', contact: 'nina.shah@example.com', balance: 0.00, status: 'Current', slot: '—' },
  ];

  // Auto-generate extra records to demonstrate the ellipsis pagination design
  for(let i = 7; i <= 45; i++) {
    initialHouseholds.push({
      id: i.toString(),
      unit: `C-${300 + i}`,
      building: 'Cedar Court',
      resident: `Demo Resident ${i}`,
      contact: `demo${i}@example.com`,
      balance: i % 4 === 0 ? 150.00 : 0.00,
      status: i % 4 === 0 ? 'Payment pending' : 'Current',
      slot: i % 5 === 0 ? `P-${10 + i}` : '—'
    });
  }

  const [households, setHouseholds] = useState<HouseholdRow[]>(initialHouseholds);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<HouseholdRow | null>(null);
  const [loadError, setLoadError] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  useEffect(() => {
    let cancelled = false;

    async function loadHouseholds() {
      const createdUnit = new URLSearchParams(window.location.search).get("created");
      if (createdUnit) {
        setSearchQuery(createdUnit);
        setCurrentPage(1);
      }

      try {
        const response = await fetch("/api/admin/households");
        if (cancelled) return;
        if (response.status === 401) {
          router.replace("/");
          return;
        }
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Could not load households.");
        }
        setLoadError("");

        const result = await response.json();
        const databaseHouseholds = (result.households ?? []).map((item: {
          id: string;
          unit: string;
          building: string;
          resident_name: string;
          email: string;
          balance: number | string;
          status: string;
          parking_slot: string | null;
        }) => ({
          id: item.id,
          unit: item.unit,
          building: item.building,
          resident: item.resident_name,
          contact: item.email,
          balance: Number(item.balance),
          status: item.status,
          slot: item.parking_slot ?? "—",
        }));

        setHouseholds((current) => [
          ...databaseHouseholds,
          ...current.filter((row) => !databaseHouseholds.some((item: { unit: string }) => item.unit.toLowerCase() === row.unit.toLowerCase())),
        ]);
      } catch (loadError) {
        if (!cancelled) {
          setLoadError(loadError instanceof Error ? loadError.message : "Could not load households from Supabase.");
        }
        // Keep the seeded demonstration records visible if the database is unavailable.
      }
    }

    void loadHouseholds();
    return () => {
      cancelled = true;
    };
  }, [router]);



  // 2. FILTER & SORT LOGIC
  const filteredHouseholds = households.filter(row => {
    const matchesSearch = 
      row.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.resident.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.contact.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All statuses' || row.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort alphabetically and numerically by unit (A-2 comes before A-10)
  const sortedHouseholds = [...filteredHouseholds].sort((a, b) => 
    a.unit.localeCompare(b.unit, undefined, { numeric: true, sensitivity: 'base' })
  );

  // Apply Pagination
  const totalPages = Math.ceil(sortedHouseholds.length / itemsPerPage);
  const paginatedHouseholds = sortedHouseholds.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const totalOutstanding = filteredHouseholds.reduce((acc, row) => acc + row.balance, 0);

  // Pagination Array Generator for the 1...99 layout
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // 3. ACTION HANDLERS
  const handleRowClick = (id: string) => {
    setSelectedId(id);
    if (isEditing) {
      setEditForm(households.find(r => r.id === id) ?? null);
    }
  };

  const handleEditClick = () => {
    if (selectedId) {
      setEditForm(households.find(r => r.id === selectedId) ?? null);
      setIsEditing(true);
    }
  };

  const handleRemoveClick = () => {
    if (selectedId) {
      setHouseholds(households.filter(r => r.id !== selectedId));
      setSelectedId(null);
      setIsEditing(false);
    }
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setHouseholds(households.map(r => r.id === editForm.id ? editForm : r));
    setIsEditing(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All statuses');
    setCurrentPage(1); 
  };

  const handleNavigateToSetup = () => {
    router.push('/admin/households/setup');
  };
return (
    <div className="min-h-screen bg-[#f9f9f9] flex font-[Arial]">
      
      

      {/* MAIN CONTENT */}
      <div className="flex-1 text-[#2d2d2d] overflow-y-auto min-w-0">
        
        {/* Topbar */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">SineGANG</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="font-bold">Administration</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">Demonstration data</span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Lock size={14} /> Secure session
            </div>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-sm text-gray-500 uppercase mb-1">COMMUNITY OPERATIONS / OCTOBER 2026</div>
              <h1 className="text-2xl font-bold mb-2">Household directory</h1>
              <p className="text-base text-gray-600">Manage unit records and registered residents. Financial audit history is always retained.</p>
            </div>
            <button 
              onClick={handleNavigateToSetup}
              type="button" 
              className="flex items-center gap-2 bg-[#ff8c00] text-white px-4 py-2 rounded-lg text-base font-bold shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
            >
              <Plus size={18} /> Create household
            </button>
          </div>

          {loadError && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
              <strong>Supabase household data did not load.</strong> {loadError} The directory is currently showing demonstration records.
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff8c00]"></div>
              After payment · 18 Oct 2026, 10:42
            </div>
            <div>PHP · Ledger</div>
          </div>

          {/* Filters */}
          <div className="flex items-end gap-4 mb-6">
            <div className="flex-1">
              <div className="text-sm font-bold mb-2">Search households</div>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search unit, resident or email" 
                  className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ff8c00]"
                />
                <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
            <div className="w-64">
              <div className="text-sm font-bold mb-2">Account status</div>
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); 
                  }}
                  className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:border-[#ff8c00] bg-white cursor-pointer"
                >
                  <option value="All statuses">All statuses</option>
                  <option value="Current">Current</option>
                  <option value="Payment pending">Payment pending</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="flex gap-6 items-start">
            
            {/* Table Section */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-20">
                <div className="text-base font-bold">Households</div>
                <div className="text-sm font-bold">{filteredHouseholds.length} records</div>
              </div>

              <div className="max-h-[320px] overflow-y-auto border-b border-gray-200 relative">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-white text-gray-600 font-bold sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
                    <tr>
                      <th className="px-6 py-4">Unit</th>
                      <th className="px-6 py-4">Registered resident</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Balance</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Slot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHouseholds.length > 0 ? (
                      paginatedHouseholds.map((row) => (
                        <tr 
                          key={row.id} 
                          onClick={() => handleRowClick(row.id)}
                          className={`cursor-pointer transition-colors border-b border-gray-50 ${selectedId === row.id ? 'bg-[#fff4e5] border-l-4 border-l-[#ff8c00]' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                        >
                          <td className="px-6 py-4 font-bold">{row.unit}</td>
                          <td className="px-6 py-4">{row.resident}</td>
                          <td className="px-6 py-4 text-gray-600">{row.contact}</td>
                          <td className="px-6 py-4 font-bold">₱{row.balance.toFixed(2)}</td>
                          <td className="px-6 py-4">{row.status}</td>
                          <td className="px-6 py-4">{row.slot}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No households match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-gray-50 text-sm text-gray-500 flex justify-between items-center">
                <div>
                  <div className="mb-4 text-[#2d2d2d]">
                    Showing {paginatedHouseholds.length} of {filteredHouseholds.length} households · Total outstanding ₱{totalOutstanding.toFixed(2)}
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => selectedId && handleNavigateToSetup()}
                      disabled={!selectedId}
                      className={`flex items-center gap-2 font-bold transition-colors ${selectedId ? 'text-[#2d2d2d] hover:text-[#ff8c00] cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                      <ExternalLink size={16} /> View
                    </button>
                    <button 
                      onClick={() => selectedId && handleEditClick()}
                      disabled={!selectedId}
                      className={`flex items-center gap-2 font-bold transition-colors ${selectedId ? 'text-[#2d2d2d] hover:text-[#ff8c00] cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => selectedId && handleRemoveClick()}
                      disabled={!selectedId}
                      className={`flex items-center gap-2 font-bold transition-colors ${selectedId ? 'text-[#2d2d2d] hover:text-red-500 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>

                {/* Updated Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 text-[#2d2d2d] text-base font-bold">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`p-1 transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:text-[#ff8c00] cursor-pointer'}`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    {getPageNumbers().map((pageNum, idx) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-gray-500 tracking-widest">...</span>
                      ) : (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => setCurrentPage(pageNum as number)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                            currentPage === pageNum 
                              ? 'bg-[#ff8c00] text-white ring-[4px] ring-[#ff8c00]/20' 
                              : 'text-gray-600 hover:text-[#ff8c00] hover:bg-gray-100 cursor-pointer'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-1 transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:text-[#ff8c00] cursor-pointer'}`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Sidebar Panel */}
            {isEditing && editForm && (
              <div className="w-[320px] bg-white rounded-xl border border-gray-200 shadow-sm p-6 shrink-0 transition-all">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-base font-bold">Edit household</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {editForm.unit}
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Unit number</label>
                    <input 
                      type="text" 
                      value={editForm.unit}
                      onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#ff8c00] focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Court / building</label>
                    <input 
                      type="text" 
                      value={editForm.building}
                      onChange={(e) => setEditForm({...editForm, building: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#ff8c00] focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Registered resident</label>
                    <input 
                      type="text" 
                      value={editForm.resident}
                      onChange={(e) => setEditForm({...editForm, resident: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#ff8c00] focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Email address</label>
                    <input 
                      type="email" 
                      value={editForm.contact}
                      onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#ff8c00] focus:bg-white" 
                    />
                  </div>
                </div>

                <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-700 mb-6">
                  Registered · Active
                </div>

                <div className="flex gap-3 mb-6 border-b border-gray-100 pb-6">
                  <button 
                    onClick={handleSaveEdit}
                    type="button" 
                    className="flex-1 py-2 bg-[#ff8c00] text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    Save changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    type="button" 
                    className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-sm text-gray-500 mb-6">
                  Saving updates the unit profile and linked contact. It does not edit posted assessments or change the resident&apos;s role.
                </div>

                <button 
                  onClick={handleNavigateToSetup}
                  type="button" 
                  className="text-sm font-bold flex items-center hover:text-[#ff8c00] transition-colors cursor-pointer"
                >
                  Open household detail <ChevronRight size={14} className="ml-1" />
                </button>
              </div>
            )}
            
          </div>
          
          <div className="text-sm text-gray-400 py-8">
            SineGANG HOA · Private community records
          </div>

        </div>
      </div>
    </div>
  );
}








