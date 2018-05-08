angular.module('bhima.services')
  .service('MultiplePayrollService', MultiplePayrollService);

MultiplePayrollService.$inject = [
  'PrototypeApiService', 'TransactionTypeStoreService', '$uibModal',
  'FilterService', 'PeriodService', 'LanguageService', '$httpParamSerializer',
  'appcache', 'TransactionService', '$translate',
];

/**
 * @class MultiplePayrollService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /multiple_payroll/ URL.  It also
 * includes some utilities that are useful for Multiple Payroll pages. 
 */
function MultiplePayrollService(
  Api, TransactionTypeStore, Modal, Filters, Periods, Languages,
  $httpParamSerializer, AppCache, Transactions, $translate
) {
  var service = new Api('/multiple_payroll/');
  var multiplePayrollFilters = new Filters();
  var filterCache = new AppCache('multiple-payroll-filters');

  //service.create = create;
  service.remove = Transactions.remove;
  service.openSearchModal = openSearchModal;

  service.filters = multiplePayrollFilters;
  service.cacheFilters = cacheFilters;
  service.removeFilter = removeFilter;
  service.loadCachedFilters = loadCachedFilters;
  service.download = download;
  service.getConfiguration = getConfiguration;
  service.setConfiguration = setConfiguration;
  service.paiementCommitment = paiementCommitment;
  service.configurations = configurations;

  // loads the Payroll Configuration
  function getConfiguration(id, params) {
    return service.$http.get(`/multiple_payroll/${id}/configuration`, { params : params })
      .then(service.util.unwrapHttpResponse);
  }

  // Set Multi Payroll Configuration using the public API
  function setConfiguration(id, data) {
    return service.$http.post(`/multiple_payroll/${id}/configuration`, { data : data })
      .then(service.util.unwrapHttpResponse);
  }

  // Set Employees Configured for Payroll
  function configurations(id, data) {
    return service.$http.post(`/multiple_payroll/${id}/multiConfiguration`, { data : data })
      .then(service.util.unwrapHttpResponse);    
  }

  /**
   *Put Employees on the Payment Agreement List
   *Transfer of the entries in accountants for the commitment of payment
  */
  function paiementCommitment(id, data) {
    return service.$http.post(`/multiple_payroll/${id}/commitment`, { data : data })
      .then(service.util.unwrapHttpResponse);
  }

  multiplePayrollFilters.registerDefaultFilters([
    { key : 'payroll_configuration_id', label : 'FORM.LABELS.PERIOD_PAYMENT' },
    { key : 'currency_id', label : 'FORM.LABELS.CURRENCY' },
  ]);

  multiplePayrollFilters.registerCustomFilters([
    { key : 'display_name', label : 'FORM.LABELS.EMPLOYEE_NAME' },
    { key : 'code', label : 'FORM.LABELS.CODE' },
    { key : 'status_id', label : 'FORM.LABELS.STATUS' },  
  ]);


  if (filterCache.filters) {
    multiplePayrollFilters.loadCache(filterCache.filters);
  }

  function removeFilter(key) {
    multiplePayrollFilters.resetFilterState(key);
  }

  //load filters from cache
  function cacheFilters() {
    filterCache.filters = multiplePayrollFilters.formatCache();
  }

  function loadCachedFilters() {
    multiplePayrollFilters.loadCache(filterCache.filters || {});
  }

  // downloads a type of report based on the
  function download(type) {
    var filterOpts = multiplePayrollFilters.formatHTTP();
    var defaultOpts = { renderer : type, lang: Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  }

  /**
   * @function openSearchModal
   * @description
   * This functions opens the search modal form for the voucher registry.
   */
  function openSearchModal(filters) {
    return Modal.open({
      templateUrl : 'modules/multiple_payroll/modals/search.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'MultiPayrollSearchModalController as $ctrl',
      resolve : {
        filters : function filtersProvider() { return filters; },
      },
    }).result;
  }

  return service;
}
