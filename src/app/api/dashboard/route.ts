return {
  subject: subject.name,
  grade: subject.grade,
  type: subject.type,
  total: subject.capacity,
  occupied,
  available: subject.capacity - occupied,
  occupancyRate: subject.capacity > 0 ? (occupied / subject.capacity) * 100 : 0,
};
