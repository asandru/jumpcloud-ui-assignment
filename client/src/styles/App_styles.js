import { makeStyles } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme) => ({
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2)
    },
    mainContentContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    button: {
        paddingRight: theme.spacing(2)
    },
    table: {
        flexGrow: 1,
        paddingRight: theme.spacing(2)
    },
    spinner: {
        position: 'absolute',
        zIndex: 200
    }
}))
