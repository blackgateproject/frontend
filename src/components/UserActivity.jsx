import React from 'react';
import {
    LogOutIcon,
    LogInIcon,
    UserPenIcon,
    LayoutPanelLeft,
} from 'lucide-react';

const UserActivity = ({ activities }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'Login':
                return <LogInIcon className="text-primary" />;
            case 'Logout':
                return <LogOutIcon className="text-secondary" />;
            case 'Profile Edit':
                return <UserPenIcon className="text-info" />;
            case 'App Access':
                return <LayoutPanelLeft className="text-accent" />;
            default:
                return null;
        }
    };

    const getBadgeClass = (type) => {
        switch (type) {
            case 'Login':
                return 'badge text-base-100 badge-primary';
            case 'Logout':
                return 'badge text-base-100  badge-secondary';
            case 'Profile Edit':
                return 'badge text-base-100  badge-info';
            case 'App Access':
                return 'badge  text-base-100 badge-accent';
            default:
                return 'badge';
        }
    };

    return (
        <div className="space-y-3">
            {activities.map((activity, index) => (
                <div
                    key={index}
                    className="flex items-center bg-white p-4 rounded-2xl hover:shadow-lg transition-shadow duration-300"
                >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                    </div>
                    {/* Text Content */}
                    <div className="ml-4 flex-grow">
                        <div className="font-semibold text-gray-800">{activity.name}</div>
                        <div className={`mt-1 ${getBadgeClass(activity.type)}`}>{activity.type}</div>
                        <div className="text-gray-600">{activity.activity}</div>
                    </div>
                    {/* Date and Badge */}
                    <div className="text-right">
                        <div className="text-gray-400 text-sm">{activity.date}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserActivity;