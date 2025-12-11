import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-1">Gift Shop</h2>
      <p className="text-slate-300 text-sm">
        This is the Stuff N Things gift shop — starter products for now, more chaos later.
      </p>

      {products.length === 0 ? (
        <p className="text-slate-400 text-sm">No products available yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {products.map((p) => (
            <li
              key={p.id}
              className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col gap-2"
            >
              <div className="font-semibold text-base">{p.name}</div>
              {p.description && (
                <div className="text-slate-400 text-xs leading-relaxed">
                  {p.description}
                </div>
              )}
              <div className="text-slate-100 font-semibold">
                ${Number(p.price).toFixed(2)}
              </div>
              {p.status && (
                <div className="text-xs text-slate-400">
                  Status: <span className="text-emerald-400">{p.status}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}