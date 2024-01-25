import { useLayoutEffect } from 'react';
import $ from 'jquery';
import DataTable from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-scroller-bs5';
import 'datatables.net-fixedheader-bs5';
import 'datatables.net-select-bs5';
import { UnistellarLink, PassDetailButton } from './helpers';
import { useSettings } from './Settings';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client'

window.luxon = require('luxon');
window.$ = $;

const tod_classes = {
  'Day': 'day',
  'Civil twilight': 'civil_twilight',
  'Nautical twilight': 'nautical_twilight',
  'Astronomical twilight': 'astronomical_twilight',
  'Night': 'night'
}

const DetailTable = ({data, satid}) => {

  let { initialValues } = useSettings();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    $('#datatable').append('<table class="table table-striped compact nowrap" />')
    $('#datatable > table').DataTable({
      data: data,
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
        { data: ( row ) => row,
          fnCreatedCell: (nTd, row) => createRoot(nTd).render(
            <PassDetailButton id={row.satellite.id}
                              t0={row.rise.timestamp} t1={row.set.timestamp}
                              settings={initialValues} navigate={navigate}/>
          ),
          orderable: false,
          searchable: false,
          responsivePriority: 1,
        },
        { data: ( row ) => row,
          fnCreatedCell: (nTd, row) => createRoot(nTd).render(
            <UnistellarLink {...row.peak} />
          ),
          orderable: false,
          searchable: false,
          responsivePriority: 1
        },
      ],
      language: {
        loadingRecords: '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>',
        emptyTable: "No matching passes found",
      },
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
      fixedHeader: true,
    });

    return () => {
      $('#datatable').empty();
    };

  });

  return (
    <div id="datatable" />
  );
};

export default DetailTable;
