export const checkToken = (token = null) => {
    const dateNow = new Date();
    const tokenDate = new Date(token?.expires_in);
    console.log(`Date now is : ${dateNow} , expiring token date is : ${tokenDate}`);
    if (token && token?.token && tokenDate.getTime() >=  dateNow.getTime()) {
      return true;
    } else {
      return false;
    }
  }