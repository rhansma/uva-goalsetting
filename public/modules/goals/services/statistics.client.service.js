'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          20-6-2015
 */

angular.module('goals').factory('Statistics', ['_', '$q', 'moment',
	function(_, $q, moment) {
		var obj = {};

    obj.getStatistics = function(statistics) {
      var deferred = $q.defer();

      var committedData = {
        date: [],
        total: []
      };

      var finishedData = {
        date: [],
        total: []
      };

      var abortedData = {
        date: [],
        total: []
      };

      /* Loop through all committed goals */
      angular.forEach(statistics.committed, function(elem) {
        var object = elem._id;
        var date = new Date(object.year, object.month - 1, object.day);

        committedData.date.push(date);
        committedData.total.push(elem.total);
      });

      /* Loop through other state changes */
      angular.forEach(statistics.finished, function(elem) {
        var object = elem._id;
        var date = new Date(object.year, object.month - 1, object.day);

        /* Count totals for right status */
        switch(object.status) {
          case 'aborted':
            abortedData.date.push(date);
            abortedData.total.push(elem.total);
            break;
          case 'finished':
            finishedData.date.push(date);
            finishedData.total.push(elem.total);
            break;
        }
      });

      /* Calculate totals */
      var totals = {
        finished: 0,
        rejected: 0,
        aborted: 0,
        expired: 0,
        committed: 0
      };

      angular.forEach(statistics.statistics, function(value) {
        switch (value._id) {
          case 'finished':
            totals.finished = value.total;
            totals.committed += value.total;
            break;
          case 'rejected':
            totals.rejected = value.total;
            totals.committed += value.total;
            break;
          case 'aborted':
            totals.aborted = value.total;
            totals.committed += value.total;
            break;
          case 'expired':
            totals.expired = value.total;
            totals.committed += value.total;
            break;
        }
      });

      deferred.resolve(obj._buildDataArrays(committedData, abortedData, finishedData, totals));

      return deferred.promise;
    };

    obj._buildDataArrays = function(committed, aborted, finished, totals) {
      var committedDates = committed.date;
      var committedTotals = committed.total;

      var abortedDates = aborted.date;
      var abortedTotals = aborted.total;

      var finishedDates = finished.date;
      var finishedTotals = finished.total;

      /* Get labels */
      var labels = obj._generateDates(committedDates, abortedDates, finishedDates);

      committedDates = obj._formatDates(committedDates);
      abortedDates = obj._formatDates(abortedDates);
      finishedDates = obj._formatDates(finishedDates);

      var data = {
        committed: [0],
        finished: [0],
        aborted: [0],
        pending: [totals.committed]
      };

      /* Generate data arrays */
      for(var i = 0; i < labels.length; i++) {
        var index = -1;

        /* Fill with data from yesterday */
        if(i > 0) {
          data.committed[i] = data.committed[i - 1];
          data.finished[i] = data.finished[i - 1];
          data.aborted[i] = data.aborted[i - 1];
          data.pending[i] = data.pending[i - 1];
        }

        /* Add todays totals if present */
        index = committedDates.indexOf(labels[i]);
        if(index !== -1) {
          data.committed[i] += committedTotals[index];
        }

        index = abortedDates.indexOf(labels[i]);
        if(index !== -1) {
          data.aborted[i] += abortedTotals[index];
          data.pending[i] -= abortedTotals[index];
        }

        index = finishedDates.indexOf(labels[i]);
        if(index !== -1) {
          data.finished[i] += finishedTotals[index];
          data.pending[i] -= finishedTotals[index];
        }
      }

      return {
        labels: labels,
        data: data,
        totals: totals
      };
    };

    obj._generateDates = function(committedDates, abortedDates, finishedDates) {
      /* Get the starting and end date */
      var dates = _.flatten(_.zip(committedDates, abortedDates, finishedDates));

      var min = moment(obj._getMinDate(dates));
      var max = moment(obj._getMaxDate(dates));

      var date = min;
      var labels = [min.format('MMM Do')];

      /* Loop through dates till max is reached */
      while(date.isBefore(max)) {
        labels.push(date.add(1, 'day').format('MMM Do'));
      }

      return labels;
    };

    /**
     * Format all dates using momentjs with format (month, day)
     * @param dates
     * @returns {*}
     * @private
     */
    obj._formatDates = function(dates) {
      for(var i = 0; i < dates.length; i++) {
        dates[i] = moment(dates[i]).format('MMM Do');
      }

      return dates;
    };

    obj._getMinDate = function(dates) {
      var timestamps = dates.map(function(date) {
        return new Date(date).getTime();
      });

      return new Date(_.min(timestamps));
    };

    obj._getMaxDate = function(dates) {
      var timestamps = dates.map(function(date) {
        return new Date(date).getTime();
      });

      return new Date(_.max(timestamps));
    };

    return obj;
	}
]);