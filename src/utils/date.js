export const formatDate = (dateString) => {
    const date = new Date(dateString);

    const options = { month: 'short' };
    const month = date.toLocaleString('en-GB', options, { timeZone: 'UTC' });
    const year = date.getFullYear();
    const day = date.getUTCDate();

    return `${month} ${day} , ${year}`;
};

export const formatDate2 = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
};

export const formatTime = (dateString) => {
    const date = new Date(dateString);

    const timeOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    };

    return date.toLocaleString('en-US', timeOptions);
};