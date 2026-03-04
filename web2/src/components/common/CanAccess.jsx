import useAuth from '../../store/useAuth'; 

export default function CanAccess({ permission, children, fallback = null }) {
  const hasPermission = useAuth((state) => state.hasPermission);

  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return fallback; 
}