import React from 'react';
import PropTypes from 'prop-types';
import { formatRelative } from 'date-fns';
import './Researcher.css'
import { Card } from '@material-ui/core'

const formatDate = date => {
    let formattedDate = '';
    if (date) {
        // Convert the date in words relative to the current date
        formattedDate = formatRelative(date, new Date());
        // Uppercase the first letter
        formattedDate =
            formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
    return formattedDate;
};

const Message = ({
    createdAt = null,
    text = '',
    displayName = '',
    photoURL = '',
    sentBySelf
}) => {
    if (!text) return null;

    return (
        <Card className="px-4 py-4 rounded-md hover:bg-gray-50 dark:hover:bg-coolDark-600 overflow-hidden flex items-start message-list-item" style={{ backgroundColor: sentBySelf ? 'rgb(220, 248, 198)' : 'white' }}>
            <div className="msg-sender-name">
                {
                    displayName ? (
                        <p className="mr-2 text-primary-500">{displayName}</p>
                    ) : null
                }
            </div>

            <div className="msg-time">
                {createdAt?.seconds ? (
                    <p>{formatDate(new Date(createdAt.seconds * 1000))}</p>
                ) : null}
            </div>

            <div className="msg-text">
                <p>{text}</p>
            </div>
        </Card>
    );
};

Message.propTypes = {
    text: PropTypes.string,
    createdAt: PropTypes.shape({
        seconds: PropTypes.number,
    }),
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
    sentBySelf: PropTypes.bool
};

export default Message;
