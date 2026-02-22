import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Shield,
  UserX,
  X,
  Loader2
} from 'lucide-react';

const ConfirmToast = ({
  t, // <-- CRITICAL: Passed the toast object for visibility states
  type = 'delete',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  itemName = '',
  confirmColor = 'red',
  icon: Icon = null,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getIcon = () => {
    if (Icon) return <Icon className="h-5 w-5" />;
    const iconMap = {
      delete: <Trash2 className="h-5 w-5 text-red-600" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      success: <CheckCircle className="h-5 w-5 text-green-600" />,
      info: <Info className="h-5 w-5 text-blue-600" />,
      verify: <Shield className="h-5 w-5 text-green-600" />,
      deactivate: <UserX className="h-5 w-5 text-orange-600" />,
    };
    return iconMap[type] || <Info className="h-5 w-5 text-blue-600" />;
  };

  const getBgColor = () => {
    const bgMap = {
      delete: 'bg-red-100',
      warning: 'bg-yellow-100',
      success: 'bg-green-100',
      info: 'bg-blue-100',
      verify: 'bg-green-100',
      deactivate: 'bg-orange-100',
    };
    return bgMap[type] || 'bg-blue-100';
  };

  const getButtonColor = () => {
    const btnMap = {
      red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      yellow: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
      orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    };
    return btnMap[confirmColor] || 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
  };

  const handleCancel = () => {
    if (isProcessing) return;
    onCancel?.();
    toast.dismiss(t.id);
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      // Await the confirm action if it's a promise, otherwise execute instantly
      await onConfirm?.();
    } finally {
      setIsProcessing(false);
      toast.dismiss(t.id);
    }
  };

  return (
    <div
      // CRITICAL FIX: Added proper background, shadow, and React Hot Toast animation classes
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-gray-100 flex flex-col p-5`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className={`h-10 w-10 rounded-full ${getBgColor()} flex items-center justify-center flex-shrink-0`}>
            {getIcon()}
          </div>
          <div className="flex-1 mt-0.5">
            <h3 className="text-base font-semibold text-gray-900 leading-none">{title}</h3>
            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
              {message}
              {itemName && <span className="font-semibold text-gray-800 ml-1">"{itemName}"</span>}
            </p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          aria-label="Close"
          className="ml-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-6">
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className={`flex items-center justify-center min-w-[90px] px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${getButtonColor()}`}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            confirmText
          )}
        </button>
      </div>
    </div>
  );
};

// Hook to show the toast
export const useConfirmToast = () => {
  const showConfirmToast = ({
    type = 'delete',
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    duration = Infinity, // Keep it open until user interacts
    position = 'top-center',
    itemName = '',
    confirmColor = 'red',
    icon = null,
  }) => {
    toast.custom(
      (t) => (
        <ConfirmToast
          t={t} // <-- Passing the toast object
          type={type}
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          onConfirm={onConfirm}
          onCancel={onCancel}
          itemName={itemName}
          confirmColor={confirmColor}
          icon={icon}
        />
      ),
      { duration, position, id: `confirm-${Date.now()}` } // Unique ID prevents stacking bugs
    );
  };

  return { showConfirmToast };
};

export default ConfirmToast;