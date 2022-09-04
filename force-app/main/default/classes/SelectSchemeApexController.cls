public with sharing class SelectSchemeApexController {

@AuraEnabled(cacheable=true)
public static FD_Details__c fetchCusType(String fdId){
    return [SELECT Id, Name, Customer_Type__c FROM FD_Details__c WHERE Id = :fdId LIMIT 1];
}

@AuraEnabled(cacheable=true)
public static List<Interest_Scheme__c> interestSchFetch(String cusType, String depType, Integer tnrDay,
                                                        Integer tnrMonth, Integer fdAmnt, String fdId){
    
    List<Interest_Scheme__c> listInt = [SELECT Id, Name, Customer_Type__c, Deposit_Type__c, From_Amount__c, To_Amount__c, Tenor_From_Months__c, Tenor_To_Months__c, Tenor_From_Days__c, Tenor_To_Days__c, Interest_Rate__c 
                                        FROM Interest_Scheme__c
                                        WHERE Customer_Type__c=:cusType AND Deposit_Type__c=:depType AND From_Amount__c<=:fdAmnt AND To_Amount__c>=:fdAmnt AND Tenor_From_Months__c<=:tnrMonth AND Tenor_To_Months__c>=:tnrMonth AND Tenor_From_Days__c<=:tnrDay AND Tenor_To_Days__c>=:tnrDay];                                               
                                        
    return listInt;
}
}