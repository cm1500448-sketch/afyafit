const onUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('afyafit_role');
  localStorage.removeItem('fitness_level');
  window.location.href = '/auth';
};

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    onUnauthorized();
    return new Promise(() => {});
  }

  return res;
};

export default authFetch;
