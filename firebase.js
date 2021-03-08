var firebaseConfig = {
// Firebase config goes here
};
const app = firebase.initializeApp(firebaseConfig);
const appDb = app.firestore();

var myUserName = null;
var myCrush = [];
var doesMyCrushLikesMe = false;
var doILikeThisUsername = false;
var crushCt = 0;
var credential;

chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
  // Use the token.
  credential = firebase.auth.GoogleAuthProvider.credential(null, token);
  firebase.auth().signInWithCredential(credential);
});


chrome.runtime.onConnect.addListener(function(port){
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(async(request) =>  {
    if (request.type == "statCrush"){
      myUserName = request.username;
      ///////////////////////
      myCrush = [];
      crushCt = 0;
      await appDb.collection(myUserName)
      .get()
      .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
              myCrush = [...myCrush, {crushname: doc.data().crushname, hasCrush: doc.data().hasCrush, crushFullName: doc.data().crushFullName}];
              crushCt++;
          });

          
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });
      ///////////////////////////
      console.log('checkCrush');
      var isCrush_ = false;
      await appDb.collection(request.crushname).where("crushname", "==", request.username)
      .get()
      .then((querySnapshot) => {
          if (querySnapshot.docs.length > 0){
            isCrush_ = true;
          }
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });

      doesMyCrushLikesMe = isCrush_;
      /////////////////////////
      isCrush_ = false;
      await appDb.collection(request.username).where("crushname", "==", request.crushname)
      .get()
      .then((querySnapshot) => {
          if (querySnapshot.docs.length > 0){
            if(!doesMyCrushLikesMe) doesMyCrushLikesMe = querySnapshot.docs[0].data().hasCrush;
            isCrush_ = true;
          }
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });
      doILikeThisUsername = isCrush_;

      //////////////////////////////

      if(doesMyCrushLikesMe && doILikeThisUsername)
        port.postMessage({
          crushCt: crushCt,
          msg:'statCrush Query recieved',
          statCrush: 2
        });
      else if(doILikeThisUsername)
        port.postMessage({
          crushCt: crushCt,
          msg:'statCrush Query recieved',
          statCrush: 1
        });
      else 
        port.postMessage({
          crushCt: crushCt,
          msg:'statCrush Query recieved',
          statCrush: 0
        });
      }
    
  });
});

chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {    
    if (request.type == 'addDb'){
      const myCrushNames = myCrush.filter((item)=> item.crushname != '').map((item)=>item.crushname);
      if (request.crushname == '' || myCrushNames.includes(request.crushname)){
        const errorMsg = 'error: crushname is blank';
      }
      else{
        appDb.collection(request.username).add({
          crushname: request.crushname,
          hasCrush: doesMyCrushLikesMe,
          crushFullName: request.fullname
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });

        if(doesMyCrushLikesMe){
          await appDb.collection(request.crushname).where("crushname", "==", request.username)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach(function(doc) {
                  var upDocRef = doc.ref;
                  return appDb.runTransaction((transaction) => {
                    return transaction.get(upDocRef).then((upDoc) => {
                      if (!upDoc.exists) {
                        throw "Document doesn't exists";
                      }
                      transaction.update(upDocRef, {hasCrush:true});
                    });
                  });
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
        }
      }
    }
    else if (request.type == 'queryDb'){
      myCrush = [];
      crushCt = 0;
      await appDb.collection(myUserName)
      .get()
      .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
              myCrush = [...myCrush, {crushname: doc.data().crushname, hasCrush: doc.data().hasCrush, crushFullName: doc.data().crushFullName}];
              crushCt++;
          });

          
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });
      
    }

    else if (request.type == 'crushCt'){
      sendResponse({
        msg:'crushCt Query recieved',
        crushCt: crushCt
      });
    }

    else if (request.type == 'setUserName'){
      myUserName = request.username;
      sendResponse({
        msg:'setUserName Query recieved'
      });
    }

    else if (request.type == 'popupClick'){
      sendResponse({msg:'query recieved',
      username: myUserName,
      crush: myCrush
      });
    }

    else if (request.type == 'checkCrushDb'){
      var isCrush_ = false;
      await appDb.collection(request.crushname).where("crushname", "==", request.username)
      .get()
      .then((querySnapshot) => {
          if (querySnapshot.docs.length > 0){
            isCrush_ = true;
          }
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });

      
      doesMyCrushLikesMe = isCrush_;
    }

    else if (request.type == 'checkUserDb'){
      var isCrush_ = false;
      await appDb.collection(request.username).where("crushname", "==", request.crushname)
      .get()
      .then((querySnapshot) => {
          if (querySnapshot.docs.length > 0){
            if(!doesMyCrushLikesMe) doesMyCrushLikesMe = querySnapshot.docs[0].data().hasCrush;
            isCrush_ = true;
          }
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });
      console.log("isCrush_ ", isCrush_);
      doILikeThisUsername = isCrush_;
    }

    else if( request.type == 'deleteDB' ){
      await appDb.collection(request.username).where("crushname", "==", request.crushname)
      .get()
      .then((querySnapshot) => {
          querySnapshot.forEach(function(doc) {
            doc.ref.delete();
          });
      })
      .catch((error) => {
          console.log("Error getting documents: ", error);
      });
    }

    setTimeout(function() {
        sendResponse({status: true});
    }, 100);
    
    return true;
  }
);



