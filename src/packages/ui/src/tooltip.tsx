import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import React, { ReactElement } from 'react';

interface CustomTooltipProps {
    title: any;
    placement?: 'bottom-start' | 'bottom' | 'bottom-end' | 'left-start' | 'left' | 'left-end' | 'right-start' | 'right' | 'right-end' | 'top-start' | 'top' | 'top-end';
    children: ReactElement;
    arrow?: boolean
    disableHoverListener?: boolean
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(37, 37, 37, 1)',
        color: 'rgba(255, 255, 255, 1)',
        boxShadow: '0px 4px 8px 0px rgba(37, 37, 37, 0.15)',
        borderRadius: '4px',
        padding: '8px'
    },
    [`& .${tooltipClasses.arrow}`]: {
        // backgroundColor: 'rgba(37, 37, 37, 1)'/
        color: 'rgba(37, 37, 37, 1)',
    },
}));

const CustomTooltip: React.FC<CustomTooltipProps> = ({
    title,
    placement = 'top',
    arrow,
    disableHoverListener,
    children }) => {
    return (
        <StyledTooltip title={title} placement={placement} disableHoverListener={disableHoverListener} arrow>
            {children}
        </StyledTooltip>
    );
};

export { CustomTooltip as Tooltip };
