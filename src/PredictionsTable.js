import { useEffect } from 'react';
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

const PredictionsTable = ({data}) => {

  let { initialValues } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    $('#datatable').append('<table class="table table-striped compact nowrap" width="100%" />')
    $('#datatable > table').DataTable({
      data: data,
      columns: [
        { title: 'satellite', data: 'satellite.name', responsivePriority: 1 },
        { title: 'NORAD ID', data: 'satellite.id', responsivePriority: 6 },
        { title: 'rise', data: 'rise.timestamp', render: DataTable.render.datetime('h:mm:ss a'), searchable: false, responsivePriority: 5 },
        { title: 'peak', data: 'peak.timestamp', render: DataTable.render.datetime('h:mm:ss a'), searchable: false, order: 'asc', responsivePriority: 1 },
        { title: 'set', data: 'set.timestamp', render: DataTable.render.datetime('h:mm:ss a'), searchable: false, responsivePriority: 5 },
        { title: 'peak alt', data: 'peak.alt', render: DataTable.render.number(null,null,0,null,'°'), searchable: false, responsivePriority: 2 },
        { title: 'peak az', data: 'peak.az', render: DataTable.render.number(null,null,0,null,'°'), searchable: false, responsivePriority: 3 },
        { title: 'peak ra/dec',
          data: ( row, type, set, meta ) => row.peak.ra + ' / ' + row.peak.dec,
          searchable: false,
          responsivePriority: 4
        },
        { title: 'sunlit',
          data: 'peak.is_sunlit',
          render: ( val, type, row ) => val?'yes':'no',
          searchable: false,
          responsivePriority: 4
        },
        { title: 'time of day',
          data: 'rise.time_of_day', 
          createdCell: function ( td, data, row, row_index, col_index ) {
            $(td).addClass(tod_classes[data]);
          },
          searchable: false,
          responsivePriority: 4
        },
        { data: ( row ) => row,
          createdCell: (nTd, row) => createRoot(nTd).render(
            <PassDetailButton id={row.satellite.id}
                              t0={row.rise.timestamp} t1={row.set.timestamp}
                              settings={initialValues} navigate={navigate}/>
          ),
          orderable: false,
          searchable: false,
          responsivePriority: 1,
        },
        { data: ( row ) => row,
          createdCell: (nTd, row) => createRoot(nTd).render(
            <UnistellarLink {...row.peak} />
          ),
          orderable: false,
          searchable: false,
          responsivePriority: 1
        }
      ],
      language: {
        loadingRecords: '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>',
        emptyTable: "No matching passes found",
      },
      orderFixed: [ 3, 'asc' ],
      select: {
        style: 'single',
        info: false
      },
      ordering: false,
      searching: true,
      paging: false,
      info: false,
      responsive: true,
      fixedHeader: false,
    });

    return () => {
      $('#datatable').empty();
    };

  });

  return (
    <div id="datatable" />
  );
};

export default PredictionsTable;
