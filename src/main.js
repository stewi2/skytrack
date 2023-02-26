import 'jquery';
import 'bootstrap';
import DataTable from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-scroller-bs5';
require('./hyperLink.js');
window.luxon = require('luxon');

function generate_unistellar_uri(ra, dec, timestamp) {
  let uri = new URL('unistellar://science/occultation')
  uri.search = new URLSearchParams({
    'ra': ra,
    'dec': dec,
    'et': 15,
    'g': 5,
    'd': 68,
    't': Math.floor(timestamp.getTime()/1000),
    'scitag': 'Satellites'
  });

  return uri;
}

function generate_detail_url(id, t0, t1) {
  let detailUrl = new URL('/pass/'+id, window.location)
  detailUrl.search = new URLSearchParams({
    'start': t0,
    'end': t1
  }) 
  return detailUrl;
}

const tod_classes = {
  'Day': 'day',
  'Civil twilight': 'civil_twilight',
  'Nautical twilight': 'nautical_twilight',
  'Astronomical twilight': 'astronomical_twilight',
  'Night': 'night'
}

export function createSatelliteListTable(target) {
  $(target).dataTable({
    ajax: {
      url: "/api/satellites",
    },
    columns: [
      { title: 'ID', data: 'id', responsivePriority: 2 },
      { title: 'Name', data: 'name', responsivePriority: 1 },
      { title: 'Epoch', data: 'epoch', render: DataTable.render.datetime('DD'), responsivePriority: 3 },
      { data: function ( row, type, set, meta ) {
          let detailUrl = new URL('/detail/'+row.id, window.location)
          return detailUrl;
        },
        render: $.fn.dataTable.render.hyperLink('<img src="/static/img/crystal-ball-future.svg" width=16 height=16 />'),
        responsivePriority: 1
      },
    ],
    responsive: true,
    autoWidth: false
  });
}

export function createPassListTable(target, satnum, visible_only) {
  $(target).dataTable({
    ajax: {
      url: "/api/satellites/" + satnum +  "/passes?visible_only=" + visible_only,
    },
    columns: [
      { title: 'date', data: 'rise.timestamp', render: DataTable.render.datetime('DD'), responsivePriority: 1 },
      { title: 'rise', data: 'rise.timestamp', render: DataTable.render.datetime('h:mm:ss a'), responsivePriority: 5 },
      { title: 'peak', data: 'peak.timestamp', render: DataTable.render.datetime('h:mm:ss a'), responsivePriority: 2 },
      { title: 'set', data: 'set.timestamp', render: DataTable.render.datetime('h:mm:ss a'), responsivePriority: 5 },
      { title: 'peak alt', data: 'peak.alt', render: DataTable.render.number(null,null,0,null,'°'), responsivePriority: 3 },
      { title: 'peak az', data: 'peak.az', render: DataTable.render.number(null,null,0,null,'°'), responsivePriority: 4 },
      { title: 'peak ra/dec',
        data: function ( row, type, set, meta ) {
          return row.peak.ra + ' / ' + row.peak.dec;
        },
        responsivePriority: 5,
      },
      { title: 'time of day', data: 'rise.time_of_day',
        createdCell: function ( td, data, row, row_index, col_index ) {
          $(td).addClass(tod_classes[data]);
        },
        responsivePriority: 5,
      },
      { data: function ( row, type, set, meta ) {
          return generate_detail_url(row.satellite.id, row.rise.timestamp, row.set.timestamp);
        },
        render: $.fn.dataTable.render.hyperLink('<img src="/static/img/parabola.svg" width=16 height=16 />'),
        responsivePriority: 1,
        orderable: false,
      },
      { data: function ( row, type, set, meta ) {
          return generate_unistellar_uri(row.peak.ra_deg, row.peak.dec_deg, new Date(row.peak.timestamp));
        },
        render: $.fn.dataTable.render.hyperLink('<img src="/static/img/telescope.svg" width=16 height=16 />'),
        responsivePriority: 1,
        orderable: false,
      },
    ],
    ordering: false,
    searching: false,
    paging: false,
    info: true,
    autoWidth: false,
    select: {
      style: 'single',
      info: false
    },
    responsive: {
      details: {
        type: 'inline'
      }
    },
//        scrollX: true,
  })
}

export function createPassDetailsTable(target, satnum, start, end) {
  $(target).DataTable({
    ajax: {
      url: "/api/satellites/" + satnum +  "/passes/" + start + "-" + end,
    },
    columns: [
      { title: 'time', data: 'timestamp', render: DataTable.render.datetime('h:mm:ss a'), responsivePriority: 1 },
      { title: 'alt', data: 'alt', render: DataTable.render.number(null,null,0,null,'°'), responsivePriority: 3 },
      { title: 'az', data: 'az', render: DataTable.render.number(null,null,0,null,'°'), responsivePriority: 3 },
      { title: 'ra/dec', data: null, render: function ( data, type, row ) { return row.ra + ' / ' + row.dec; }, responsivePriority: 5 },
      { title: 'angular rate', data: 'angular_rate', render: DataTable.render.number(null,null,0,null,' arcmin/s'), responsivePriority: 4},
      { title: 'Distance', data: 'distance', render: DataTable.render.number(null,null,0,null,' km'), responsivePriority: 4},
      { title: 'sunlit', data: 'is_sunlit', render: function ( val, type, row ) { return val?'<span class="bi bi-brightness-high">yes</span>':'<span class="bi bi-brightness-high-fill">no</span>' }, responsivePriority: 3 },
      { data: function ( row, type, set, meta ) {
        return generate_unistellar_uri(row.ra_deg, row.dec_deg, new Date(row.timestamp));
      },
      render: $.fn.dataTable.render.hyperLink('<img src="/static/img/telescope.svg" width=16 height=16 />'),
      responsivePriority: 1
      },
    ],
    searching: false,
    paging: false,
    info: false,
    responsive: true,
    ordering: false,
    select: {
      style: 'single',
      info: false
    },
  });
}

export function createPredictionsTable(target, visible_only) {
  $(target).DataTable({
    ajax: {
      url: "/api/satellites/predictions?visible_only=" + visible_only,
    },
    columns: [
      { title: 'satellite', data: 'satellite.name', responsivePriority: 1 },
      { title: 'rise', data: 'rise.timestamp', render: DataTable.render.datetime('h:mm:ss a'), visible: true, responsivePriority: 5 },
      { title: 'peak', data: 'peak.timestamp', render: DataTable.render.datetime('h:mm:ss a'), order: 'asc', responsivePriority: 1 },
      { title: 'set', data: 'set.timestamp', render: DataTable.render.datetime('h:mm:ss a'), visible: true, responsivePriority: 5 },
      { title: 'peak alt', data: 'peak.alt', render: DataTable.render.number(null,null,1,null,'°'), responsivePriority: 2 },
      { title: 'peak az', data: 'peak.az', render: DataTable.render.number(null,null,1,null,'°'), responsivePriority: 3 },
      { title: 'peak ra/dec',
        data: function ( row, type, set, meta ) {
          return row.peak.ra + ' / ' + row.peak.dec;
        },
        visible: true,
        responsivePriority: 4
      },
      { title: 'sunlit', data: 'peak.is_sunlit', render: function ( val, type, row ) { return val?'yes':'no' }, responsivePriority: 4  },
      { title: 'time of day', data: 'rise.time_of_day', visible: true, 
        createdCell: function ( td, data, row, row_index, col_index ) {
          $(td).addClass(tod_classes[data]);
        },
        responsivePriority: 4 },
      { data: function ( row, type, set, meta ) {
          return generate_unistellar_uri(row.peak.ra_deg, row.peak.dec_deg, new Date(row.peak.timestamp));
        },
        render: $.fn.dataTable.render.hyperLink('<img src="/static/img/parabola.svg" width=16 height=16 />'),
        responsivePriority: 1,
        orderable: false,
      },
      { data: function ( row, type, set, meta ) {
        return generate_unistellar_uri(row.peak.ra_deg, row.peak.dec_deg, new Date(row.peak.timestamp));
        },
        render: $.fn.dataTable.render.hyperLink('<img src="/static/img/telescope.svg" width=16 height=16 />'),
        responsivePriority: 1,
        orderable: false,
      }
    ],
    ordering: false,
    searching: true,
    paging: false,
    info: false,
    responsive: true,
});
}