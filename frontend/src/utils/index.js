// Frontend utilities placeholder for Phase 2 helper functions
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};
