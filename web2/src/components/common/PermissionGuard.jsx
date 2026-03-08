import React from 'react';
import useAuth from '../../store/useAuth';

const PermissionGuard = ({ requiredPermission, children, fallback = null }) => {
  const { hasPermission } = useAuth();

  // যদি কোনো পারমিশন রিকোয়ারমেন্ট না থাকে, তাহলে সরাসরি কন্টেন্ট দেখিয়ে দিবে
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // ইউজারের নির্দিষ্ট পারমিশন আছে কি না চেক করা হচ্ছে
  const isAllowed = hasPermission(requiredPermission);

  // পারমিশন থাকলে ভেতরের কন্টেন্ট (বাটন/সেকশন) রেন্ডার করবে
  if (isAllowed) {
    return <>{children}</>;
  }

  // পারমিশন না থাকলে ফলব্যাক দেখাবে (ডিফল্টভাবে null, মানে কিছুই দেখাবে না)
  return fallback;
};

export default PermissionGuard;