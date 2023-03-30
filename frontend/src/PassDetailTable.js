import { useLayoutEffect } from 'react';
import { renderToString } from 'react-dom/server'
import $ from 'jquery';
import DataTable from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-scroller-bs5';
import 'datatables.net-fixedheader-bs5';
import 'datatables.net-select-bs5';
import { UnistellarLink } from './helpers';

window.luxon = require('luxon');
window.$ = $;

const PassDetailTable = ({data, satid}) => {

  useLayoutEffect(() => {
    $('#datatable').append('<table class="table table-striped compact nowrap" />')
    $('#datatable > table').DataTable({
      data: data,
      columns: [
        { title: 'time', data: 'timestamp', render: DataTable.render.datetime('h:mm:ss a'), responsivePriority: 1 },
        { title: 'alt', data: 'alt', render: DataTable.render.number(null,null,0,null,'°'), responsivePriority: 3 },
        { title: 'az', data: 'az', render: DataTable.render.number(null,null,0,null,'°'), responsivePriority: 3 },
        { title: 'ra/dec', data: null, render: function ( data, type, row ) { return row.ra + ' / ' + row.dec; }, responsivePriority: 5 },
        { title: 'angular rate', data: 'angular_rate', render: DataTable.render.number(null,null,0,null,' arcmin/s'), responsivePriority: 4},
        { title: 'Distance', data: 'distance', render: DataTable.render.number(null,null,0,null,' km'), responsivePriority: 4},
        { title: 'sunlit', data: 'is_sunlit', render: function ( val, type, row ) { return val?'Y':'N' }, responsivePriority: 3 },
        { data: ( row, type, set, meta ) => renderToString(<UnistellarLink ra_deg={row.ra_deg} dec_deg={row.dec_deg} timestamp={row.timestamp} />),
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
      fixedHeader: false
    });

    return () => {
      $('#datatable').empty();
    };

  });

  return (
    <div id="datatable" />
  );
};

export default PassDetailTable;
