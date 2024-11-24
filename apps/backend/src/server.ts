import {app} from "@/app"
import {config} from "@/configs/env-config"
import { createLogger } from './utils/loger';


const logger = createLogger();

app.get('/', (_req, res) => {
  res.send('Hello World')
})

app.listen(config.PORT, () => {
  logger.start(`Server is running on port ${config.PORT}`)
})

