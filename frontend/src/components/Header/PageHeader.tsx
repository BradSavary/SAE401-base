import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThreadsIcon } from '../../ui/LogoIcon/threads';
import { ArrowIcon } from '../../ui/Icon/arrow';

interface PageHeaderProps {
    title?: string;
    showLogo?: boolean;
    logoSize?: 'small' | 'medium' | 'large' | 'xlarge';
    showBackButton?: boolean;
    backTo?: string;
    rightComponent?: ReactNode;
    onBack?: () => void;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showLogo = true,
    logoSize = 'large',
    showBackButton = false,
    backTo = '',
    rightComponent,
    onBack,
    className = ''
}) => {
    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };

    return (
        <div className={`flex items-center justify-between w-full px-4 py-3 ${className}`}>
            <div className="flex items-center">
                {showBackButton && (
                    backTo ? (
                        <Link to={backTo} className="mr-4">
                            <ArrowIcon className="h-6 w-6" alt="Back" />
                        </Link>
                    ) : (
                        <button onClick={handleBack} className="mr-4">
                            <ArrowIcon className="h-6 w-6" alt="Back" />
                        </button>
                    )
                )}
                
                {title && (
                    <h1 className="text-xl font-bold text-custom">{title}</h1>
                )}
            </div>
            
            {showLogo && (
                <div className="flex justify-center flex-grow md:justify-start md:ml-0">
                    <Link to="/" className="hidden md:block">
                        <ThreadsIcon size={logoSize} alt="Threads-logo" />
                    </Link>
                    <Link to="/" className="md:hidden">
                        <ThreadsIcon size={logoSize} alt="Threads-logo" />
                    </Link>
                </div>
            )}
            
            <div className="flex items-center">
                {rightComponent}
            </div>
        </div>
    );
};

export default PageHeader; 