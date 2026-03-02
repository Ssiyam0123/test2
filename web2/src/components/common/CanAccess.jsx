import React from 'react';
import useAuth from '../../store/useAuth';

const CanAccess = ({ permission, children, fallback = null }) => {
  const { authUser } = useAuth();

  const hasPermission = () => {
    if (!authUser) return false;

    // 1. MASTER KEY: Superadmins always get access to everything
    const roleName = typeof authUser.role === 'string' ? authUser.role : authUser.role?.name;
    if (roleName === "superadmin") return true;

    // 2. CHECK PERMISSIONS ARRAY: Check if they have 'all_access' or the specific required permission
    const userPerms = authUser.permissions || [];
    if (userPerms.includes("all_access")) return true;

    // 3. EXACT MATCH
    return userPerms.includes(permission);
  };

  // If they have permission, render the component (like a button)
  if (hasPermission()) {
    return <>{children}</>;
  }

  // If they don't have permission, render nothing (or a fallback like a locked icon)
  return fallback;
};

export default CanAccess;