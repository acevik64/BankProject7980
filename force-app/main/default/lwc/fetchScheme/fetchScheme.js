import { LightningElement, wire, api, track } from 'lwc';
import fetchCusTypeLocal from '@salesforce/apex/SelectSchemeApexController.fetchCusType'
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi'
import FdDetailLocal from '@salesforce/schema/FD_Details__c'
import depTypeLocal from '@salesforce/schema/FD_Details__c.Deposit_Type__c'
import payFreqLocal from '@salesforce/schema/FD_Details__c.Payout_Frequency__c'
import interestSchFetch from '@salesforce/apex/SelectSchemeApexController.interestSchFetch'



export default class FetchScheme extends LightningElement {
    @api recordId

    customerOptions = []
    selectedCusType = ''

    depTypeOptions = []
    selectedDepType = ''

    payFreqData
    payFreqOptions = []
    selectedPayFreq = ''

    tenorInMonth = ''
    tenorInDay = ''
    FdAmount = 0

    listScheme = []
    selectedIntRate

    
    @wire(fetchCusTypeLocal, {
        fdId:'$recordId'
    }) wiredData({ data, error }) {
        if (data) {
            let option = [];
            option.push({ label: data.Customer_Type__c, value: data.Customer_Type__c })
            this.customerOptions = option;
            console.log('Option is ' + JSON.stringify(this.customerOptions));
        }
        else if (error) {
            console.log('During fetching Customer Type from DB Unexpected Error occured, Error Message:' +
                JSON.stringify(error))
        }
    }

    cusTypeChange(event) {
        this.selectedCusType = event.detail.value
    }

    @wire(getObjectInfo, { objectApiName: FdDetailLocal }) fdObjectInfo
    
    @wire(getPicklistValues, { recordTypeId: '$fdObjectInfo.data.defaultRecordTypeId', fieldApiName: depTypeLocal })
    wiredDataDep({ error, data }) {
        if (data) {
            let options = [];
            data.values.forEach(element => {
                options.push({ label: element.label, value: element.value });
            });

            this.depTypeOptions = options;
            console.log('Options are ' + JSON.stringify(this.depTypeOptions));
        }
        else if (error) {
            console.log('During fetching Deposit Type options, Unexpected Error occured, Error Message:' +
                JSON.stringify(error))
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$fdObjectInfo.data.defaultRecordTypeId', fieldApiName: payFreqLocal })
    wiredDataPay({ error, data }) {
        if (data) {
            this.payFreqData = data
            console.log('Payout Freq Options : ' + this.payFreqData)
        } else if (error) {
            console.log('During fetching Payout Freq options, Unexpected Error occured, Error Message:' +
                JSON.stringify(error))
        }
    }
    
    depTypeChange(event) {
        this.selectedDepType = event.detail.value
        let key = this.payFreqData.controllerValues[event.detail.value]
        this.payFreqOptions = this.payFreqData.values.filter(opt=>opt.validFor.includes(key))
    }

    payoutFreqChange(event) {
        this.selectedPayFreq = event.detail.value
    }

    get tenorMonthOptions() {
        let options = []
        for (var i = 0; i < 85;i++){
            options.push({label:i.toString(), value:i.toString()})
        }
        return options
    }

    tenorMonthChange(event) {
        this.tenorInMonth = event.detail.value
    }

    get tenorDayOptions() {
        let options = []
        for (var i = 0; i < 30;i++){
            options.push({label:i.toString(), value:i.toString()})
        }
        return options
    }

    tenorDayChange(event) {
        this.tenorInDay = event.detail.value
    }

    fdAmountChange(event) {
        this.FdAmount = event.detail.value
    }

    fetchScheme(event) {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.clsFrmFetchSchm');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });

        if (isValid) {
            interestSchFetch({
                cusType: this.selectedCusType,
                depType: this.selectedDepType,
                tnrDay: this.tenorInDay,
                tnrMonth: this.tenorInMonth,
                fdAmnt: this.FdAmount,
                fdId: this.recordId
            }).then(result => {
                var lstSchm = []
                if (result) {
                    for (var i = 0; i < result.length;i++){
                        var tempObj = {}
                        tempObj.label = result[i].Name
                        tempObj.value = result[i].Id
                        tempObj.interestRate = result[i].Interest_Rate__c
                        lstSchm.push(tempObj)
                    }
                }
                this.listScheme = lstSchm

            })
                .catch(error => {
                    console.log('Unexpected Error has been occured during fetching Interest Scheme Data. Error Message: ' + error.Message)
            })
        }

    } 

}
