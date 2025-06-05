import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SearchTable() {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get('https://jsonplaceholder.typicode.com/users');
            return res.data;
        };

        fetchData().then(setData);
    }, []);
    let filteredData = data;
    if (query) {
        filteredData = data.filter(
            (item) =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.email.toLowerCase().includes(query.toLowerCase()) ||
                item.username.toLowerCase().includes(query.toLowerCase())
        );
    }
    let sortedData = filteredData;
    if (sortConfig.key) {
        sortedData = [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const start = (currentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(start, start + pageSize);

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getAriaSort = (key) => {
        if (sortConfig.key !== key) return 'none';
        return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
    };

    return (
        <div className="container my-4">
            <h2 className="mb-3">Search</h2>
            <input
                type="search"
                className="form-control mb-3"
                placeholder="Search by name, username, or email"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                }}
                aria-label="Search users"
            />
            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSort('name')}
                                onKeyPress={(e) => e.key === 'Enter' && handleSort('name')}
                                aria-sort={getAriaSort('name')}
                                scope="col"
                            >
                                Name
                                {sortConfig.key === 'name' ? (
                                    sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
                                ) : null}
                            </th>
                            <th
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSort('username')}
                                onKeyPress={(e) => e.key === 'Enter' && handleSort('username')}
                                aria-sort={getAriaSort('username')}
                                scope="col"
                            >
                                Username
                                {sortConfig.key === 'username' ? (
                                    sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
                                ) : null}
                            </th>
                            <th
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSort('email')}
                                onKeyPress={(e) => e.key === 'Enter' && handleSort('email')}
                                aria-sort={getAriaSort('email')}
                                scope="col"
                            >
                                Email
                                {sortConfig.key === 'email' ? (
                                    sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
                                ) : null}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center">
                                    No results found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.username}</td>
                                    <td>
                                        <a href={`mailto:${user.email}`}>{user.email}</a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <nav aria-label="Table pagination">
                <ul className="pagination justify-content-center">
                    <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            aria-label="Previous page"
                            disabled={currentPage === 1}
                        >
                            &laquo;
                        </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <li
                            key={i + 1}
                            className={`page-item${currentPage === i + 1 ? ' active' : ''}`}
                        >
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(i + 1)}
                                aria-label={`Page ${i + 1}`}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            aria-label="Next page"
                            disabled={currentPage === totalPages}
                        >
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
