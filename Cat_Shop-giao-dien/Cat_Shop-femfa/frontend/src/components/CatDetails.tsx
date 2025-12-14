import React, { useState } from 'react';
import axios from 'axios';

interface CreateCatDetailPayload {
  catId: number;
  breed: string;
  age: number;
  gender: string;
  vaccinated: boolean;
}

interface CatDetailItem {
  catId: number;
  breed: string;
  age: number;
  gender: 'Male' | 'Female' | string;
  vaccinated: boolean;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const CatDetails: React.FC = () => {
  const [catId, setCatId] = useState<number | ''>('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [vaccinated, setVaccinated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [list, setList] = useState<CatDetailItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [loadingCustomerList, setLoadingCustomerList] = useState(false);
  const [customerList, setCustomerList] = useState<CatDetailItem[]>([]);
  const [customerPage, setCustomerPage] = useState(0);
  const [customerTotalPages, setCustomerTotalPages] = useState(0);
  const [customerPageSize, setCustomerPageSize] = useState(3);
  const [searchBreed, setSearchBreed] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'Male' | 'Female' | ''>('');
  const [filteringGender, setFilteringGender] = useState(false);
  const [vaccinatedFilter, setVaccinatedFilter] = useState<'' | 'true' | 'false'>('');
  const [filteringVaccinated, setFilteringVaccinated] = useState(false);

  const mapDetail = (d: any): CatDetailItem => ({
    catId: d?.catId ?? d?.cat_id ?? 0,
    breed: d?.breed ?? '',
    age: d?.age ?? 0,
    gender: d?.gender ?? '',
    vaccinated: Boolean(d?.vaccinated),
  });

  const setFormFromItem = (item: CatDetailItem, fallbackId?: number) => {
    const idToUse = typeof item.catId === 'number' && item.catId > 0 ? item.catId : (fallbackId ?? 0);
    setCatId(idToUse);
    setBreed(item.breed ?? '');
    setAge(typeof item.age === 'number' ? item.age : '');
    setGender(item.gender === 'Male' || item.gender === 'Female' ? (item.gender as 'Male' | 'Female') : '');
    setVaccinated(Boolean(item.vaccinated));
  };

  const buildPayload = (): CreateCatDetailPayload => ({
    catId: Number(catId),
    breed: breed.trim(),
    age: Number(age),
    gender,
    vaccinated,
  });

  const ensureValidForm = (): boolean => {
    if (typeof catId !== 'number' || typeof age !== 'number' || !breed.trim() || !gender) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return false;
    }
    return true;
  };

  const fetchPage = async (
    url: string,
    setItems: (items: CatDetailItem[]) => void,
    setTotalPages: (n: number) => void,
    setPage: (n: number) => void,
    setPageSize: (n: number) => void,
    setLoading: (b: boolean) => void,
    fallbackSize: number,
  ) => {
    setLoading(true);
    try {
      const resp = await axios.get(url);
      const pageData: PageResponse<CatDetailItem> = (resp.data?.data ?? resp.data) as PageResponse<CatDetailItem>;
      if (pageData && Array.isArray(pageData.content)) {
        const mapped = pageData.content.map(mapDetail) as CatDetailItem[];
        setItems(mapped);
        setTotalPages(pageData.totalPages ?? 0);
        setPage(pageData.number ?? 0);
        setPageSize(pageData.size ?? fallbackSize);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFlatListAndReset = async (
    url: string,
    setItems: (items: CatDetailItem[]) => void,
    setTotalPages: (n: number) => void,
    setPage: (n: number) => void,
  ) => {
    const resp = await axios.get(url);
    const listData = (resp.data?.data ?? resp.data) as CatDetailItem[];
    const mapped = (Array.isArray(listData) ? listData : []).map(mapDetail) as CatDetailItem[];
    setItems(mapped);
    setTotalPages(0);
    setPage(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!ensureValidForm()) return;
    const payload = buildPayload();
    setSubmitting(true);
    try {
      const resp = await axios.post('http://localhost:8080/api/admin/cat-details', payload);
      setMessage({ type: 'success', text: 'CatDetails created successfully.' });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to create CatDetails. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setMessage(null);
    const targetId = typeof catId !== 'number' ? 1 : Number(catId);
    setSubmitting(true);
    try {
      await axios.delete(`http://localhost:8080/api/admin/cat-details/${targetId}`);
      setMessage({ type: 'success', text: `Deleted CatDetails (ID ${targetId}) successfully.` });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to delete CatDetails. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setMessage(null);
    if (!ensureValidForm()) return;
    const payload = buildPayload();
    const targetId = typeof catId !== 'number' ? 1 : Number(catId);
    setSubmitting(true);
    try {
      const resp = await axios.put(`http://localhost:8080/api/admin/cat-details/${targetId}`, payload);
      setMessage({ type: 'success', text: `Updated CatDetails (ID ${targetId}) successfully.` });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update CatDetails. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFetchById = async (role: 'admin' | 'customer' = 'admin') => {
    setMessage(null);
    const targetId = typeof catId !== 'number' ? 1 : Number(catId);
    setSubmitting(true);
    try {
      const baseUrl = role === 'admin' ? 'http://localhost:8080/api/admin/cat-details' : 'http://localhost:8080/api/cat-details';
      const resp = await axios.get(`${baseUrl}/${targetId}`);
      const d = resp.data?.data ?? resp.data;
      if (d) {
        const item = mapDetail(d);
        setFormFromItem(item, targetId);
        setMessage({ type: 'success', text: `Loaded CatDetails (${role}) ID ${targetId} successfully.` });
      } else {
        setMessage({ type: 'error', text: `CatDetails (${role}) not found.` });
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || `Failed to load CatDetails (${role}). Please try again.`;
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchList = async (
    role: 'admin' | 'customer',
    page: number,
    size: number,
  ) => {
    const baseUrl = role === 'admin' ? 'http://localhost:8080/api/admin/cat-details' : 'http://localhost:8080/api/cat-details';
    const itemsSetter = role === 'admin' ? setList : setCustomerList;
    const totalPagesSetter = role === 'admin' ? setTotalPages : setCustomerTotalPages;
    const pageSetter = role === 'admin' ? setCurrentPage : setCustomerPage;
    const pageSizeSetter = role === 'admin' ? setPageSize : setCustomerPageSize;
    const loadingSetter = role === 'admin' ? setLoadingList : setLoadingCustomerList;
    await fetchPage(
      `${baseUrl}?page=${page}&size=${size}`,
      itemsSetter,
      totalPagesSetter,
      pageSetter,
      pageSizeSetter,
      loadingSetter,
      size,
    );
  };

  const searchCustomerByBreed = async (breed: string) => {
    const term = breed.trim();
    if (term === '') {
      await fetchList('customer', 0, customerPageSize);
      return;
    }
    setSearchingCustomer(true);
    try {
      await fetchFlatListAndReset(
        `http://localhost:8080/api/cat-details/search?breed=${encodeURIComponent(term)}`,
        setCustomerList,
        setCustomerTotalPages,
        setCustomerPage,
      );
    } finally {
      setSearchingCustomer(false);
    }
  };

  const filterCustomerByGender = async (gender: 'Male' | 'Female' | '') => {
    if (!gender) {
      await fetchList('customer', 0, customerPageSize);
      return;
    }
    setFilteringGender(true);
    try {
      await fetchFlatListAndReset(
        `http://localhost:8080/api/cat-details/filter/gender?gender=${encodeURIComponent(gender)}`,
        setCustomerList,
        setCustomerTotalPages,
        setCustomerPage,
      );
    } finally {
      setFilteringGender(false);
    }
  };

  const filterCustomerByVaccinated = async (vaccinated: '' | 'true' | 'false') => {
    if (!vaccinated) {
      await fetchList('customer', 0, customerPageSize);
      return;
    }
    setFilteringVaccinated(true);
    try {
      await fetchFlatListAndReset(
        `http://localhost:8080/api/cat-details/filter/vaccinated?vaccinated=${encodeURIComponent(vaccinated)}`,
        setCustomerList,
        setCustomerTotalPages,
        setCustomerPage,
      );
    } finally {
      setFilteringVaccinated(false);
    }
  };

  interface ListTableProps {
    role: 'admin' | 'customer';
    list: CatDetailItem[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    fetchList: (page: number, size: number) => Promise<void>;
  }

  const ListTable: React.FC<ListTableProps> = ({
    role,
    list,
    loading,
    currentPage,
    totalPages,
    pageSize,
    fetchList,
  }) => (
    <div className="bg-white p-4 rounded-md">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccinated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((item) => (
                <tr key={item.catId}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.catId}</td>
                  <td className="px-6 py-4">{item.breed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.vaccinated ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setFormFromItem(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Load
                    </button>
                    {role === 'admin' ? (
                      <button
                        onClick={() => { setCatId(item.catId); handleDelete(); }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => { setCatId(item.catId); handleFetchById('customer'); }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Refresh
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchList(Math.max(0, currentPage - 1), pageSize)}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchList(currentPage + 1, pageSize)}
                disabled={currentPage >= totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage + 1}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => fetchList(0, pageSize)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => fetchList(Math.max(0, currentPage - 1), pageSize)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchList(currentPage + 1, pageSize)}
                    disabled={currentPage >= totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => fetchList(Math.max(0, totalPages - 1), pageSize)}
                    disabled={currentPage >= totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Last
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Create Cat Details</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Cat ID</label>
          <input
            type="number"
            value={catId}
            onChange={(e) => setCatId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter Cat ID (product_id of the cat)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Breed</label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., British Shorthair"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            min={0}
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Age (months)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | '')}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">-- Select gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="vaccinated"
            type="checkbox"
            checked={vaccinated}
            onChange={(e) => setVaccinated(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="vaccinated" className="text-sm font-medium">
            Vaccinated
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Cat Details'}
          </button>
          <button
            type="button"
            onClick={() => handleFetchById('admin')}
            disabled={submitting}
            className="ml-2 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {submitting ? 'Loading...' : 'Load Cat Details'}
          </button>
          <button
            type="button"
            onClick={() => handleFetchById('customer')}
            disabled={submitting}
            className="ml-2 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {submitting ? 'Loading...' : 'Load Cat Details (Customer)'}
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="ml-2 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Cat Details'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? 'Deleting...' : 'Delete Cat Details'}
          </button>
        </div>
      </form>

      {/* Admin List */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">Admin — Cat Details</h2>
          <button
            type="button"
            onClick={() => fetchList('admin', 0, pageSize)}
            disabled={loadingList}
            className="ml-auto px-3 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {loadingList ? 'Loading...' : 'Load list'}
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value) || 5;
              setPageSize(newSize);
              fetchList('admin', 0, newSize);
            }}
            className="px-2 py-2 border rounded-md"
          >
            <option value={2}>2 / page</option>
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
          </select>
        </div>
        <ListTable
          role="admin"
          list={list}
          loading={loadingList}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          fetchList={(page, size) => fetchList('admin', page, size)}
        />
      </div>

      {/* Customer List */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h2 className="text-xl font-semibold">Customer — Cat Details</h2>
          <input
            type="text"
            placeholder="Search breed (e.g. British)"
            value={searchBreed}
            onChange={(e) => setSearchBreed(e.target.value)}
            className="min-w-[220px] px-3 py-2 border rounded-md"
          />
          <button
            type="button"
            onClick={() => searchCustomerByBreed(searchBreed)}
            disabled={searchingCustomer}
            className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {searchingCustomer ? 'Searching...' : 'Search'}
          </button>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as 'Male' | 'Female' | '')}
            className="px-2 py-2 border rounded-md"
          >
            <option value="">-- Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <button
            type="button"
            onClick={() => filterCustomerByGender(genderFilter)}
            disabled={filteringGender}
            className="px-3 py-2 bg-primary/80 text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {filteringGender ? 'Filtering...' : 'Filter'}
          </button>
          <select
            value={vaccinatedFilter}
            onChange={(e) => setVaccinatedFilter(e.target.value as '' | 'true' | 'false')}
            className="px-2 py-2 border rounded-md"
          >
            <option value="">-- Vaccinated --</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <button
            type="button"
            onClick={() => filterCustomerByVaccinated(vaccinatedFilter)}
            disabled={filteringVaccinated}
            className="px-3 py-2 bg-primary/80 text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {filteringVaccinated ? 'Filtering...' : 'Filter vaccinated'}
          </button>
          <button
            type="button"
            onClick={() => { setSearchBreed(''); setGenderFilter(''); setVaccinatedFilter(''); fetchList('customer', 0, customerPageSize); }}
            className="px-3 py-2 border rounded-md hover:bg-gray-100"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => fetchList('customer', 0, customerPageSize)}
            disabled={loadingCustomerList}
            className="ml-auto px-3 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {loadingCustomerList ? 'Loading...' : 'Load list'}
          </button>
          <select
            value={customerPageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value) || 3;
              setCustomerPageSize(newSize);
              fetchList('customer', 0, newSize);
            }}
            className="px-2 py-2 border rounded-md"
          >
            <option value={3}>3 / page</option>
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
          </select>
        </div>
        <ListTable
          role="customer"
          list={customerList}
          loading={loadingCustomerList}
          currentPage={customerPage}
          totalPages={customerTotalPages}
          pageSize={customerPageSize}
          fetchList={(page, size) => fetchList('customer', page, size)}
        />
      </div>
    </div>
  );
};

export default CatDetails;