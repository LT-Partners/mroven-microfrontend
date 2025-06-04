import React from 'react';
import { CssBaseline, Box, Typography, Paper } from '@mui/material';

interface DiffItem {
  key: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  value?: any;
  leftValue?: any;
  rightValue?: any;
}

const PrettyJSON = ({ data }: { data: string }) => {
  const prettyPrint = (obj: any, indent = 0) => {
    return Object.entries(obj).map(([key, value]) => (
      <Box key={key} sx={{ ml: indent * 2 }}>
        <Typography component="span" color="primary">
          "{key}"
        </Typography>
        <Typography component="span">: </Typography>
        {typeof value === 'object' && value !== null ? (
          <>
            <Typography component="span">
              {Array.isArray(value) ? '[' : '{'}
            </Typography>
            {prettyPrint(value, indent + 1)}
            <Box sx={{ ml: indent * 2 }}>
              <Typography component="span">
                {Array.isArray(value) ? ']' : '}'}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography component="span" color="secondary">
            {typeof value === 'string' ? `"${value}"` : `${value}`}
          </Typography>
        )}
        {indent === 0 && <Typography component="span">,</Typography>}
      </Box>
    ));
  };

  return (
    <Box sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <Typography>{'{'}</Typography>
      {prettyPrint(JSON.parse(data))}
      <Typography>{'}'}</Typography>
    </Box>
  );
};

function JsonViewer({ jsonData }: { jsonData: string }) {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #ccc',
        borderRadius: 2,
        maxHeight: '400px',
        overflow: 'auto',
      }}>
      <PrettyJSON data={jsonData} />
    </Box>
  );
}

type jsonDiffProps = {
  leftJson: string;
  rightJson: string;
};

const JsonDiffViewer: React.FC<jsonDiffProps> = ({ leftJson, rightJson }) => {
  const compareJson = (left: string, right: string): DiffItem[] => {
    const leftObj = JSON.parse(left);
    const rightObj = JSON.parse(right);
    const allKeys = new Set([
      ...Object.keys(leftObj),
      ...Object.keys(rightObj),
    ]);

    return Array.from(allKeys).map((key) => {
      if (!(key in leftObj)) {
        return { key, status: 'added', value: rightObj[key] };
      }
      if (!(key in rightObj)) {
        return { key, status: 'removed', value: leftObj[key] };
      }
      if (JSON.stringify(leftObj[key]) !== JSON.stringify(rightObj[key])) {
        return {
          key,
          status: 'changed',
          leftValue: leftObj[key],
          rightValue: rightObj[key],
        };
      }
      return { key, status: 'unchanged', value: leftObj[key] };
    });
  };

  const renderDiff = (diff: DiffItem[]) => {
    return diff
      .filter((item) => item.status !== 'unchanged')
      .map(({ key, status, value, leftValue, rightValue }) => (
        <Box
          key={key}
          display="flex"
          borderBottom={1}
          borderColor="divider"
          sx={{ '&:last-child': { borderBottom: 0 } }}>
          <Box width="50%" p={1}>
            {status === 'removed' && (
              <Typography color="error">
                - {key}: {JSON.stringify(value)}
              </Typography>
            )}
            {status === 'changed' && (
              <Typography color="error">
                - {key}: {JSON.stringify(leftValue)}
              </Typography>
            )}
            {status === 'added' && (
              <Typography color="text.disabled">{key}: undefined</Typography>
            )}
          </Box>
          <Box width="50%" p={1}>
            {(status === 'added' || status === 'changed') && (
              <Typography color="success.main">
                + {key}:{' '}
                {JSON.stringify(status === 'added' ? value : rightValue)}
              </Typography>
            )}
            {status === 'removed' && (
              <Typography color="text.disabled">{key}: undefined</Typography>
            )}
          </Box>
        </Box>
      ));
  };

  const diff = compareJson(leftJson, rightJson);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
      <CssBaseline />
      <Box sx={{ p: 2, width: '100%' }}>
        <Box display="flex" mb={2} gap={2}>
          <Box width="50%">
            <Typography variant="h6" align="center">
              Old JSON
            </Typography>
            <JsonViewer jsonData={leftJson} />
          </Box>
          <Box width="50%">
            <Typography variant="h6" align="center">
              New JSON
            </Typography>
            <JsonViewer jsonData={rightJson} />
          </Box>
        </Box>
        <Typography variant="h6" align="center" mt={4} mb={2}>
          Changes (Added, Removed, and Modified Items)
        </Typography>
        <Paper elevation={3}>
          <Box display="flex" fontWeight="bold" p={1} bgcolor="action.hover">
            <Box width="50%">Old</Box>
            <Box width="50%">New</Box>
          </Box>
          {renderDiff(diff)}
        </Paper>
      </Box>
    </div>
  );
};

export default JsonDiffViewer;
