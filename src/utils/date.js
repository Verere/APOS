export const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Get month
    const options = { month: 'short' };
    const month = date.toLocaleString('en-GB', options, { timeZone: 'UTC' });
   
    // Get year
    const year = date.getFullYear()

    // Get day
    const day = date.getUTCDate();

    // Format time in UTC 12-hour
    const timeOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    };

    const time = date.toLocaleString('en-US', timeOptions);

    // Final formatted string
    return `${month} ${day} , ${year}`;
  };
export const formatTime = (dateString) => {
    const date = new Date(dateString);

    // Get month
    const options = { month: 'short' };
    const month = date.toLocaleString('en-GB', options, { timeZone: 'UTC' });
   
    // Get year
    const year = date.getFullYear()

    // Get day
    const day = date.getUTCDate();

    // Format time in UTC 12-hour
    const timeOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    };

    const time = date.toLocaleString('en-US', timeOptions);

    // Final formatted string
    return `${time}`;
  };