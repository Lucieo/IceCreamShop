exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
      pageTitle: 'Page Not Found', 
      path:undefined,
      isLoggedIn: req.isLoggedIn
    });
  };

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!', 
    path:'/500',
    isLoggedIn: req.isLoggedIn
  });
};