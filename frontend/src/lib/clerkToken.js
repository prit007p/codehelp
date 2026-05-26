let clerkTokenGetter = null;

export const setClerkTokenGetter = (getter) => {
  clerkTokenGetter = getter;
};

export const getClerkToken = async () => {
  if (!clerkTokenGetter) return null;
  return clerkTokenGetter();
};
