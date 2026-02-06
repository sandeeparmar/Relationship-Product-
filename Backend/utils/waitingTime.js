export const calculateWaitingTime = (queueNumber , consultationTime) => {
  if(!queueNumber || queueNumber < 1) return 0 ;
  return (queueNumber-1)*consultationTime ;
} ;