// verifie qu'il n'y a pas de champs vide ou nul 
function checkBody(body, keys) {
    let isValid = true;
  
    for (const field of keys) {
      if (!body[field] || body[field] === '') {
        isValid = false;
      }
    }
  
    return isValid;
  }
  
  module.exports = { checkBody };