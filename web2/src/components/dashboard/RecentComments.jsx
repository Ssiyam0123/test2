import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar'; 
import { formatDistanceToNow } from 'date-fns';

const RecentComments = ({ recentComments = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <MessageSquare size={18} />
          </div>
          <h3 className="font-bold text-gray-800">Recent Instructor Feedback</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {recentComments.length === 0 ? (
          <div className="text-center text-sm text-gray-400 mt-10">No recent feedback.</div>
        ) : (
          recentComments.map((comment) => (
            <div key={comment._id} className="group border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-2">
                  <Avatar src={comment.instructor?.photo_url} fallbackText={comment.instructor?.full_name} size="sm" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-800 leading-none">
                      {comment.instructor?.full_name || "Unknown Instructor"}
                    </p>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {comment.student && (
                  <Link 
                    to={`/admin/student/${comment.student._id}`} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-50 text-gray-500 rounded hover:text-blue-600"
                    title="View Student Profile"
                  >
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
              
              <div className="mt-2 pl-10">
                <p className="text-[12px] text-gray-600 line-clamp-2">
                  <span className="font-bold text-gray-700 mr-1">
                    On {comment.student?.student_name}:
                  </span>
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentComments;