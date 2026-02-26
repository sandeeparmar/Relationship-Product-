import xmlbuilder from "xmlbuilder" ;

export const generateODM = (patient , encounters) => {  
  const odm = xmlbuilder.create("ODM")  ;
  const clinicalData = odm.ele("ClinicalData") ;

  const subject = clinicalData.ele("SubjectData" , {
    SubjectKey : patient._id 
  }) ;

  encounters.forEach(e => {
    const studyEvent = subject.ele("StudyEventData") ;

    studyEvent.ele("ItemGroupData").ele("ItemData" , {
       Name : "Diagnosis" , 
       Value : e.diagnosis 
    }) ;

    studyEvent.ele("ItemGroupData").ele("ItemData" , {
      Name : "Medication" ,
      Value  : e.medication
    }) ;
  }) ; 
  return odm.end({pretty : true}) ;
} ;