import { makeStyles } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme) => ({
    rootContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2)
    },
    textField: {
        paddingRight: theme.spacing(2)
    }
}))
